import { Request, Response, NextFunction } from 'express';
import RiderModel, { IRider } from '../../models/rider';
import log from '../../utils/logger';

export const listRiders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.query;
        const filter = name ? { name } : {};
        const riders: IRider[] = await RiderModel.find(filter);
        const riderModels = riders.map(rider => new RiderModel(rider));
        const ridersJson = riderModels.map(riderModel => riderModel.toJSON());
        log.info(`listRiders::Riders fetched successfully : ${JSON.stringify(ridersJson)}`);
        res.status(200).json(ridersJson);
    }
    catch (err: any) {
        log.error(`listRiders:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
};

export const createNewRider = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rider: IRider = new RiderModel(req.body);
        await rider.save();
        log.info(`createNewRider::Rider created successfully : ${JSON.stringify(rider.toJSON())}`);
        res.status(201).json(rider.toJSON());
    }
    catch (err: any) {
        log.error(`createNewRider:: ${err}`);
        res.status(400).json({
            status: 400,
            message: err.message,
        });
    }
    next();
};

export const updateRider = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const riderName = req.body.name;
        const updateData = req.body;

        const updatedRider = await RiderModel.findOneAndUpdate(
            { name: String(riderName) },
            updateData,
            { new: true, runValidators: true }
        );
        if (!updatedRider) {
            log.error(`updateRider::Rider not found : ${updatedRider}`);
            return res.status(404).json({ message: "Rider not found" });
        }
        log.info(`updateRider::Rider updated successfully : ${updatedRider.toJSON()}`);
        res.status(200).json(updatedRider);
    }
    catch (err: any) {
        log.error(`updateRider:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
};

export const deleteRider = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const riderName = req.body.name;

        const deletedRider = await RiderModel.findOneAndDelete({ name: String(riderName) });

        if (!deletedRider) {
            log.error(`deleteRider::Rider not found : ${riderName}`);
            return res.status(404).json({ message: "Rider not found" });
        }
        log.info(`deleteRider::Rider deleted successfully : ${deletedRider}`);
        res.status(200).json({
            status: 200,
            message: `Rider ${riderName} deleted successfully`,
        });
    }
    catch (err: any) {
        log.error(`deleteRider:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
};
