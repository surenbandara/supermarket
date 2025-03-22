import { NextFunction, Request, Response } from "express";
import OrderModel, {Order, IOder} from "../../models/order"; 
import { OrderStatus, PriceBag, TotalBill } from "../../models/common";
import log from '../../utils/logger';
import ProductModel from "../../models/product";
import { SysParaCache } from "../../models/sys-config";

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
        
        console.log (JSON.stringify(order.productList))

        await validateProductListAndSetTotalBill(order);
        
        order.status = OrderStatus.INITIATED;

        

        log.info(`createNewOrder::Order created successfully : ${order}`);
        res.status(201).json(order);
    } catch (err: any) {
        log.error(`createNewOrder:: ${err}`);
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
            log.warn(`validateProductList::Product not found: ${item.productId}`);
            item.availableQuantity = 0;
            item.truePrice = 0;
            continue;
        }

        if (product.quantity < item.quantity) {
            log.warn(`validateProductList::Insufficient stock for product: ${item.productId}`);
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









export const createOrder = async (req: Request, res: Response) => {
    try {
        const newOrder = new OrderModel(req.body);
        await newOrder.save();
        res.status(201).json({ message: "Order created successfully", order: newOrder });
    } catch (error) {
        res.status(500).json({ message: "Error creating order", error });
    }
};

// Get an order by ID
export const getOrderById = async (req: Request, res: Response) => {
    try {
        const order = await OrderModel.findOne({ id: req.params.id });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Error fetching order", error });
    }
};


export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { status, paymentStatus } = req.body;
        const order = await OrderModel.findOneAndUpdate(
            { id: req.params.id },
            { status, paymentStatus },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ message: "Order updated successfully", order });
    } catch (error) {
        res.status(500).json({ message: "Error updating order", error });
    }
};

// Delete an order
export const deleteOrder = async (req: Request, res: Response) => {
    try {
        const order = await OrderModel.findOneAndDelete({ id: req.params.id });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting order", error });
    }
};
