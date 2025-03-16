import { Request, Response, NextFunction } from 'express';
import ShopModel, { IShop } from '../../models/shop';
import log from '../../utils/logger';
import VendorModel from '../../models/vendor';

export const listShops = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //TODO: add quary support for category.
        const { name } = req.query;
        const filter = name ? { name } : {};
        const shops: IShop[] = await ShopModel.find(filter);
        const shopModels = shops.map(shop => new ShopModel(shop));
        const shopsJson = shopModels.map(shopModel => shopModel.toJSON());
        log.info(`listShops::Shops fetched successfully : ${JSON.stringify(shopsJson)}`);
        res.status(200).json(shopsJson);
    }
    catch (err: any) {
        log.error(`listShops:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
};

export const createNewShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shop: IShop = new ShopModel(req.body);
        // if (await updateVendor(shop)) {
            await shop.save();
            log.info(`createNewShop::Shop created successfully : ${JSON.stringify(shop.toJSON())}`);
            res.status(201).json(shop.toJSON());
        // } else {
        //     log.info(`createNewShop::Vendor is invalid : ${JSON.stringify(shop.toJSON())}`);
        //     res.status(400).json({ "message": "Vendor is invalid or not existing." });
        // }
    }
    catch (err: any) {
        log.error(`createNewShop:: ${err}`);
        res.status(400).json({
            status: 400,
            message: err.message,
        });
    }
    next();
};

//TODO: do we allow to change vendor of the shop
export const updateShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shopName = req.body.name;
        const updateData = req.body;

        const updatedShop = await ShopModel.findOneAndUpdate(
            { name: String(shopName) },
            updateData,
            { new: true, runValidators: true }
        );
        if (!updatedShop) {
            log.error(`updateShop::Shop not found : ${shopName}`);
            return res.status(404).json({ message: "Shop not found" });
        }
        log.info(`updateShop::Shop updated successfully : ${updatedShop}`);
        res.status(200).json(updatedShop);
    }
    catch (err: any) {
        log.error(`updateShop:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
};

// TODO: no dependent entities before deleting the shop
export const deleteShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shopName = req.body.name;

        const deletedShop = await ShopModel.findOneAndDelete({ name: String(shopName) });

        if (!deletedShop) {
            log.error(`deleteShop::Shop not found : ${shopName}`);
            return res.status(404).json({ message: "Shop not found" });
        }
        log.info(`deleteShop::Shop deleted successfully : ${deletedShop}`);
        res.status(200).json({
            status: 200,
            message: `Shop ${shopName} deleted successfully`,
        });
    }
    catch (err: any) {
        log.error(`deleteShop:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
};

const updateVendor = async (shop: IShop): Promise<boolean> => {
    try {
        const vendor = await VendorModel.findOne({ name: shop.vendorName });
        if (!vendor) {
            return false;
        } else {
            vendor.shopList
                .push(shop.name);
            const updatedVendor = await VendorModel.findOneAndUpdate(
                { name: String(vendor.name) },
                vendor,
                { new: true, runValidators: true }
            );
            return true;
        }
    } catch (err: any) {
        log.error(`isVendorAvailable:: ${err}`);
        throw new Error("Error checking vendor availability");
    }
};

