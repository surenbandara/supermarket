import { NextFunction, Request, Response } from "express";
import OrderModel, { Order, IOder } from "../../models/order";
import { OrderStatus, PriceBag, TotalBill } from "../../models/common";
import log from '../../utils/logger';
import ProductModel from "../../models/product";
import { SysParaCache } from "../../models/sys-config";
import mongoose from "mongoose";

export const listOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filter: any = {};

        if (req.query.id) filter.id = Number(req.query.id);
        if (req.query.userId) filter.userId = req.query.userId;
        if (req.query.status) filter.status = req.query.status;
        if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

        const orders = await OrderModel.find(filter).sort({ timestamp: -1 });

        log.info(`listOrders::Orders fetched successfully`);
        res.status(200).json(orders);
    } catch (err: any) {
        log.error(`listOrders:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
};

export const requestNewOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order: Order = req.body as Order;
        order.id = Date.now();
        order.status = OrderStatus.NEW;

        console.log(JSON.stringify(order.productList))

        await validateProductListAndSetTotalBill(order);

        order.status = OrderStatus.INITIATED;

        log.info(`requestNewOrder::Order requested successfully : ${order}`);
        res.status(201).json(order);
    } catch (err: any) {
        log.error(`requestNewOrder:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
};

export const confirmOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order: Order = req.body as Order;
        const existingOrder: Order = JSON.parse(JSON.stringify(order)) as Order;

        if (!validateUser(req, order)) {
            res.status(401).json({
                status: 401,
                message: "Invalid User",
            });
            return;
        }

        const filter: any = {};
        if (order.id) filter.id = Number(order.id);
        const existingOrderRecord = await OrderModel.find(filter);
        if (existingOrderRecord.length>0) {
            log.error(`confirmOrder:: Order exist for orderId: ${order.id}`);
            res.status(400).json({
                status: 400,
                message: "Order exist for orderId",
            });
            return;
        }

        // validation to check unnecessary modifications. 
        await validateProductListAndSetTotalBill(existingOrder);
        if (order.totalPrice.payableAmount !== existingOrder.totalPrice.payableAmount) {
            log.error(`confirmOrder:: Price difference itentified: order: ${order.totalPrice.payableAmount}, existingOrder: ${existingOrder.totalPrice.payableAmount}`);
            res.status(400).json({
                status: 400,
                message: "Price difference itentified",
            });
            return;
        }

        if (order.status != OrderStatus.CONFIRMED) {
            log.error(`confirmOrder:: Invalid order status: ${order.status}`);
            res.status(400).json({
                status: 400,
                message: "Invalid Order Status to allocate products",
            });
            return;
        }

        console.log(JSON.stringify(order));

        if (await allocateProductListAndCreateBill(order)) {
            log.info(`confirmOrder:: Allocate products process successfully completed}`);

            const orderRecord: IOder = new OrderModel({
                id: order.id,
                bill: PriceBag.toString(order.productList),
                totalPrice: TotalBill.toString(order.totalPrice),
                status: OrderStatus.PROCESSIONG,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                userId: order.userId,
                userLocation: order.userLocation,
                timestamp: Date.now(),
                discount: order?.discount,
                additionalNote: order?.additionalNote,
            });

            await orderRecord.save();
            log.info(`confirmOrder:: Updated order db record successfully ${JSON.stringify(orderRecord.toJSON())}}`);

            res.status(201).json(orderRecord.toJSON());
            return;

        } else {
            log.error(`confirmOrder:: Allocate products process failed }`);
            res.status(500).json({
                status: 500,
                message: "Allocate products process failed",
            });
            return;
        }
    } catch (err: any) {
        log.error(`confirmOrder:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
};


const validateProductListAndSetTotalBill = async (order: Order) => {
    let totalCost = 0;
    let totalDiscount = 0;
    for (const item of order.productList as PriceBag[]) {

        const product = await ProductModel.findOne({ id: item.productId });

        if (!product) {
            log.warn(`validateProductListAndSetTotalBill::Product not found: ${item.productId}`);
            item.availableQuantity = 0;
            item.truePrice = 0;
            continue;
        }

        if (product.quantity < item.quantity) {
            log.warn(`validateProductListAndSetTotalBill::Insufficient stock for product: ${item.productId}`);
            item.availableQuantity = product.quantity;
        } else {
            item.availableQuantity = item.quantity;
        }
        item.truePrice = product.price;

        totalCost += (item.availableQuantity) * (item.truePrice);
        totalDiscount += (product?.discount ?? 0);

    }
    let loyaltyPoints = 0;
    let deliveryCost = await SysParaCache.getInstance().get("deliveryCost")
    order.totalPrice = new TotalBill(totalCost, Number(deliveryCost), loyaltyPoints, totalDiscount);

    return;
};


const allocateProductListAndCreateBill = async (order: Order) => {
    const originalQuantities: { productId: number, originalQuantity: number }[] = [];

    try {
        for (const item of order.productList as PriceBag[]) {

            const product = await ProductModel.findOne({ id: item.productId });

            if (!product) {
                log.warn(`allocateProductListAndCreateBill::Product not found: ${item.productId}`);
                await rollbackProductUpdates(originalQuantities);
                return false;
            }

            if (product.quantity < item.quantity) {
                log.warn(`allocateProductListAndCreateBill::Insufficient stock for product: ${item.productId}`);
                await rollbackProductUpdates(originalQuantities);
                return false;  
            }

            originalQuantities.push({ productId: product.id, originalQuantity: product.quantity });

            const updatedProduct = await ProductModel.findOneAndUpdate(
                { id: product.id },
                { $inc: { quantity: -item.quantity } },
                { new: true, upsert: false }
            );

            if (!updatedProduct) {
                log.error(`allocateProductListAndCreateBill::Failed to update product: ${item.productId}`);
                await rollbackProductUpdates(originalQuantities);
                return false; 
            }
        }
        return true;  
    } catch (error) {
        log.error(`allocateProductListAndCreateBill::Error occurred: ${error}`);
        await rollbackProductUpdates(originalQuantities);
        return false;
    }
};

// Rollback function to revert changes made during the process
const rollbackProductUpdates = async (originalQuantities: { productId: number, originalQuantity: number }[]) => {
    if (originalQuantities.length === 0) {return}
    for (const { productId, originalQuantity } of originalQuantities) {
        await ProductModel.findOneAndUpdate(
            { id: productId },
            { $set: { quantity: originalQuantity } },
            { new: true }
        );
        log.info(`rollbackProductUpdates::Product quantity restored for product: ${productId}`);
    }
};


export const validateUser = (req: Request, order: Order) => {
    if (order.userId === req.authResult?.id) {
        return true;
    } else {
        log.error(`validateUser:: order userId: ${order.userId} and requestId: ${req.authResult?.id} not matched`);
        return false;
    }
};


export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order: IOder = req.body as IOder;

        //// do the necessary status validations
        if (order.status == OrderStatus.PROCESSIONG || order.status == OrderStatus.SHIPPED || order.status == OrderStatus.DELIVERED) {
            log.error(`confirmOrder:: Invalid order status: ${order.status}`);
            res.status(400).json({
                status: 400,
                message: "Invalid Order Status to allocate products",
            });
            return;
        }

        const filter: any = {};
        if (order.id) filter.id = Number(order.id);
        const existingOrderRecord = await OrderModel.findOne(filter);
        if (!existingOrderRecord) {
            log.error(`cancelOrder:: Not existing Order for orderId: ${order.id}`);
            res.status(400).json({
                status: 400,
                message: "Not existing Order for orderId",
            });
            return;
        }

        if (await releaseProductList(existingOrderRecord)) {
            log.info(`cancelOrder:: Cancel products process successfully completed}`);
 
            const orderRecord = await OrderModel.findOneAndUpdate(
                { id: existingOrderRecord.id },
                { $set: { status: OrderStatus.CANCELLED } },
                { new: true }
            );

            log.info(`cancelOrder:: Canceled: ${JSON.stringify(orderRecord?.toJSON())} order successfully}`);

            res.status(201).json(orderRecord?.toJSON());
            return;

        } else {
            log.error(`cancelOrder:: cancel process failed }`);
            res.status(500).json({
                status: 500,
                message: "cancel process failed",
            });
            return;
        }
    } catch (err: any) {
        log.error(`cancelOrder:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
};

const releaseProductList = async (order: IOder) => {
    const originalQuantities: { productId: number, originalQuantity: number }[] = [];

    try {
        for (const item of PriceBag.fromString(order.bill) as PriceBag[]) {

            const product = await ProductModel.findOne({ id: item.productId });

            if (!product) {
                log.warn(`releaseProductList::Product not found: ${item.productId}`);
                await rollbackProductUpdates(originalQuantities);
                return false;
            }

            originalQuantities.push({ productId: product.id, originalQuantity: product.quantity });

            const updatedProduct = await ProductModel.findOneAndUpdate(
                { id: product.id },
                { $inc: { quantity: +item.quantity } },
                { new: true, upsert: true }
            );

            if (!updatedProduct) {
                log.error(`releaseProductList::Failed to update product: ${item.productId}`);
                await rollbackProductUpdates(originalQuantities);
                return false; 
            }
        }
        return true;  
    } catch (error) {
        log.error(`releaseProductList::Error occurred: ${error}`);
        await rollbackProductUpdates(originalQuantities);
        return false;
    }
};
