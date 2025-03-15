import { Request, Response, NextFunction } from 'express';
import ProductModel, { IProduct } from '../../models/product';
import { Category, Shop } from '../../models/common';
import log from '../../utils/logger';

export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products: IProduct[] = await ProductModel.find();
        log.info(`listProducts::Products fetched successfully : ${products}`);
        res.status(200).json(products);
    }
    catch (err: any) {
        log.error(`listProducts:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
};

export const createNewProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product: IProduct = new ProductModel(req.body);
        await product.save();
        log.info(`createNewProduct::Product created successfully : ${product}`);
        res.status(201).json(product);
    }
    catch (err: any) {
        log.error(`createNewProduct:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = req.body;
        const productId = req.body.id;
        const updateData = req.body;

        const updatedProduct = await ProductModel.findOneAndUpdate(
            { id: Number(productId) },
            updateData,
            { new: true, runValidators: true }
        );
        if (!updatedProduct) {
            log.error(`updateProduct::Product not found : ${productId}` );
            return res.status(404).json({ message: "Product not found" });
        }
        log.info(`updateProduct::Product updated successfully : ${updatedProduct}`);
        res.status(200).json(updatedProduct);
    }
    catch (err: any) {
        log.error(`updateProduct:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = req.body.id;

        const deletedProduct = await ProductModel.findOneAndDelete({ id: Number(productId) });

        if (!deletedProduct) {
            log.error(`deleteProduct::Product not found : ${productId}`);
            return res.status(404).json({ message: "Product not found" });
        }
        log.info(`deleteProduct::Product deleted successfully : ${deletedProduct}`);
        res.status(200).json({
            status: 200,
            message: `Product with id ${productId} deleted successfully`,
        });

    }
    catch (err: any) {
        log.error(`deleteProduct:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
};

export const filterProducts = async (req: Request, res: Response, next: NextFunction) => {
    // try {

    //     res.status(200).json(products);
    // }
    // catch (err: any) {
    //     console.log("ERROR::filterProducts: ", err);
    //     res.status(500).json({
    //         status: 500,
    //         message: "Internal Server Error",
    //     });
    // }
    next();
};
