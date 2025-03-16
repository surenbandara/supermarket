import { Request, Response, NextFunction } from 'express';
import VendorModel, { IVendor } from '../../models/vendor';
import log from '../../utils/logger';

export const listVendors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.query;
        const filter = name ? { name } : {};
        const vendors: IVendor[] = await VendorModel.find(filter);
        const vendorModels = vendors.map(vendor => new VendorModel(vendor));
        const vendorsJson = vendorModels.map(vendorModel => vendorModel.toJSON());
        log.info(`listVendors::Vendors fetched successfully : ${JSON.stringify(vendorsJson)}`);
        res.status(200).json(vendorsJson);
    }
    catch (err: any) {
        log.error(`listVendors:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
};

export const createNewVendor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vendor: IVendor = new VendorModel(req.body);
        // vendor.shopList = [];
        await vendor.save();
        log.info(`createNewVendor::Vendor created successfully : ${JSON.stringify(vendor.toJSON())}`);
        res.status(201).json(vendor.toJSON());
    }
    catch (err: any) {
        log.error(`createNewVendor:: ${err}`);
        res.status(400).json({
            status: 400,
            message: err.message,
        });
    }
    next();
};

export const updateVendor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vendorName = req.body.name;
        const updateData = req.body;

        const updatedVendor = await VendorModel.findOneAndUpdate(
            { name: String(vendorName) },
            updateData,
            { new: true, runValidators: true }
        );
        if (!updatedVendor) {
            log.error(`updateVendor::Vendor not found : ${updatedVendor}`);
            return res.status(404).json({ message: "Vendor not found" });
        }
        log.info(`updateVendor::Vendor updated successfully : ${updatedVendor}`);
        res.status(200).json(updatedVendor);
    }
    catch (err: any) {
        log.error(`updateVendor:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
};


//TODO: Dont allow to remove if there are shops attached to this vendor.
export const deleteVendor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vendorName = req.body.name;

        const deletedVendor = await VendorModel.findOneAndDelete({ name: String(vendorName) });

        if (!deletedVendor) {
            log.error(`deleteVendor::Vendor not found : ${vendorName}`);
            return res.status(404).json({ message: "Vendor not found" });
        }
        log.info(`deleteVendor::Vendor deleted successfully : ${deletedVendor}`);
        res.status(200).json({
            status: 200,
            message: `Vendor ${vendorName} deleted successfully`,
        });
    }
    catch (err: any) {
        log.error(`deleteVendor:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
};
