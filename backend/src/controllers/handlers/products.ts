import { Request, Response, NextFunction } from 'express';
import ProductModel, { IProduct } from '../../models/product';
import log from '../../utils/logger';
import admin from "../../controllers/handlers/authenticator";

const firestore = admin.firestore();

const bucket = admin.storage().bucket();

export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products: IProduct[] = await ProductModel.find();
        // log.info(`listProducts::Products fetched successfully : ${products}`);
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

// export const createNewProduct = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const product: IProduct = new ProductModel(req.body);
//         product.id = Date.now();
//         await product.save();
//         log.info(`createNewProduct::Product created successfully : ${product}`);
//         res.status(201).json(product);
//     }
//     catch (err: any) {
//         log.error(`createNewProduct:: ${err}`);
//         res.status(500).json({
//             status: 500,
//             message: "Internal Server Error",
//         });
//     }
//     next();
// };

export const createNewProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let imageUrl: string | undefined = undefined;

        if (req.body.image) {
            const base64Image = req.body.image.replace(/^data:image\/\w+;base64,/, "");;
            const buffer = Buffer.from(base64Image, "base64");

            const filename = `products/${Date.now()}_${Math.random().toString(36).substring(2)}.jpg`;
            const file = bucket.file(filename);

            await file.save(buffer, {
                metadata: {
                    contentType: "image/jpeg",
                },
                public: true,
            });

            imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
            req.body.image = imageUrl; // Replace with the download URL
        }

        const product: IProduct = new ProductModel(req.body);
        product.id = Date.now();
        product.timestamp = Date.now();
        await product.save();

        log.info(`createNewProduct::Product created successfully : ${product}`);
        res.status(201).json(product);
    } catch (err: any) {
        log.error(`createNewProduct:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
};

// export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const product = req.body;
//         const productId = req.body.id;
//         const updateData = req.body;

//         const updatedProduct = await ProductModel.findOneAndUpdate(
//             { id: Number(productId) },
//             updateData,
//             { new: true, runValidators: true }
//         );
//         if (!updatedProduct) {
//             log.error(`updateProduct::Product not found : ${productId}`);
//             return res.status(404).json({ message: "Product not found" });
//         }
//         log.info(`updateProduct::Product updated successfully : ${updatedProduct}`);
//         res.status(200).json(updatedProduct);
//     }
//     catch (err: any) {
//         log.error(`updateProduct:: ${err}`);
//         res.status(500).json({
//             status: 500,
//             message: "Internal Server Error",
//         });
//     }
//     next();
// };

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = req.body.id;
        const updateData = { ...req.body };

        const existingProduct = await ProductModel.findOne({ id: Number(productId) });
        if (!existingProduct) {
            log.error(`updateProduct::Product not found : ${productId}`);
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if image has changed
        if (updateData.image && updateData.image !== existingProduct.image) {
            if (existingProduct.image?.includes("https://storage.googleapis.com/")) {
                const filePath = existingProduct.image.split(`https://storage.googleapis.com/${bucket.name}/`)[1];
                if (filePath) {
                    await bucket.file(filePath).delete().catch(err => {
                        log.warn(`updateProduct::Failed to delete old image: ${filePath} - ${err.message}`);
                    });
                }
            }

            const base64Data = updateData.image.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");

            const filename = `products/${Date.now()}_${Math.random().toString(36).substring(2)}.jpg`;
            const file = bucket.file(filename);

            await file.save(buffer, {
                metadata: { contentType: "image/jpeg" },
                public: true,
            });

            const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
            updateData.image = imageUrl;
        }

        const updatedProduct = await ProductModel.findOneAndUpdate(
            { id: Number(productId) },
            updateData,
            { new: true, runValidators: true }
        );

        log.info(`updateProduct::Product updated successfully : ${updatedProduct}`);
        res.status(200).json(updatedProduct);
    } catch (err: any) {
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
    try {
        const {
            name,
            priceRange,
            quantityRange,
            cusine,
            brand,
            shop,
            discount,
            timestampRange,
            limit = 10,
            page = 1
        } = req.body;

        const filter: any = {};

        if (name) filter.name = { $regex: new RegExp(name, "i") };
        if (priceRange?.min !== undefined || priceRange?.max !== undefined) {
            filter.price = {};
            if (priceRange.min !== undefined) filter.price.$gte = priceRange.min;
            if (priceRange.max !== undefined) filter.price.$lte = priceRange.max;
        }
        if (quantityRange?.min !== undefined || quantityRange?.max !== undefined) {
            filter.quantity = {};
            if (quantityRange.min !== undefined) filter.quantity.$gte = quantityRange.min;
            if (quantityRange.max !== undefined) filter.quantity.$lte = quantityRange.max;
        }
        if (cusine && cusine.length > 0) filter.cusine = { $in: cusine }; // Matches any in the array
        if (brand) filter.brand = brand;
        if (shop) filter.shop = shop;
        if (discount !== undefined) filter.discount = discount;
        if (timestampRange?.start !== undefined || timestampRange?.end !== undefined) {
            filter.timestamp = {};
            if (timestampRange.start !== undefined) filter.timestamp.$gte = timestampRange.start;
            if (timestampRange.end !== undefined) filter.timestamp.$lte = timestampRange.end;
        }

        const products = await ProductModel.find(filter)
            .sort({ timestamp: -1 }) // Sort by latest products
        // .skip((page - 1) * limit)
        // .limit(limit);

        log.info(`filterProducts::Products fetched successfully`);
        res.status(200).json(products);
    } catch (err: any) {
        log.error(`filterProducts:: ${err.message}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
};

export const backupProducts = async () => {
    try {
        const products: IProduct[] = await ProductModel.find();

        // Firestore Sync 
        try {
            const batch = firestore.batch();
            const collectionRef = firestore.collection("products");

            products.forEach(product => {
                const docRef = collectionRef.doc(product.id.toString());
                batch.set(docRef, product.toObject());
            });

            await batch.commit();
            log.info(`listProducts:: Firestore backup completed for ${products.length} products`);
        } catch (firestoreError) {
            log.error(`listProducts:: Firestore backup failed: ${firestoreError}`);
        }

    } catch (err: any) {
        log.error(`listProducts:: ${err}`);
    }
};

