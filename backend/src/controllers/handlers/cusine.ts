import { Request, Response, NextFunction } from 'express';
import CuisineModel, { ICuisine } from '../../models/cusine';
import log from '../../utils/logger';

export const listCusines = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.query;
        const filter = name ? { name } : {};
        const cuisines: ICuisine[] = await CuisineModel.find(filter);
        const cuisineModels = cuisines.map(cuisine => new CuisineModel(cuisine));
        const cuisinesJson = cuisineModels.map(cuisineModel => cuisineModel.toJSON());
        log.info(`listCuisines::Cuisines fetched successfully : ${JSON.stringify(cuisinesJson)}`);
        res.status(200).json(cuisinesJson);
    }
    catch (err: any) {
        log.error(`listCuisines:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
};

export const createNewCusine = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cuisine: ICuisine = new CuisineModel(req.body);
        await cuisine.save();
        log.info(`createNewCuisine::Cuisine created successfully : ${JSON.stringify(cuisine.toJSON())}`);
        res.status(201).json(cuisine.toJSON());
    }
    catch (err: any) {
        log.error(`createNewCuisine:: ${err}`);
        res.status(400).json({
            status: 400,
            message: err.message,
        });
    }
    next();
};

export const updateCusine = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cuisineName = req.body.name;
        const updateData = {name:req.body.newName, timestamp: req.body.timestamp};

        const updatedCuisine = await CuisineModel.findOneAndUpdate(
            { name: String(cuisineName) },
            updateData,
            { new: true, runValidators: true }
        );
        if (!updatedCuisine) {
            log.error(`updateCuisine::Cuisine not found : ${cuisineName}`);
            return res.status(404).json({ message: "Cuisine not found" });
        }
        log.info(`updateCuisine::Cuisine updated successfully : ${updatedCuisine}`);
        res.status(200).json(updatedCuisine);
    }
    catch (err: any) {
        log.error(`updateCuisine:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
};

export const deleteCusine = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cuisineName = req.body.name;

        const deletedCuisine = await CuisineModel.findOneAndDelete({ name: String(cuisineName) });

        if (!deletedCuisine) {
            log.error(`deleteCuisine::Cuisine not found : ${cuisineName}`);
            return res.status(404).json({ message: "Cuisine not found" });
        }
        log.info(`deleteCuisine::Cuisine deleted successfully : ${deletedCuisine}`);
        res.status(200).json({
            status: 200,
            message: `Cuisine ${cuisineName} deleted successfully`,
        });
    }
    catch (err: any) {
        log.error(`deleteCuisine:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
};
