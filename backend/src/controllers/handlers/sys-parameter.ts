import { Request, Response, NextFunction } from 'express';
import SysConfigModel, { SysParaCache } from '../../models/sys-config';
import log from '../../utils/logger';
import admin from "../../controllers/handlers/authenticator";

const firestore = admin.firestore();

export const listSystemParameters = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.query;

        let query = name ? { name } : {};
        const parameters = await SysConfigModel.find(query);

        res.status(200).json(parameters);
    } catch (error: any) {
        log.error(`listSystemParameters:: error: ${error.message}`);
        res.status(500).json({ message: "Failed to retrieve system parameters" });
    }
};

export const createSystemParameter = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, value } = req.body;

        if (!name || value === undefined) {
            res.status(400).json({ message: "Name and value are required" });
            return;
        }

        const existingParam = await SysConfigModel.findOne({ name });
        if (existingParam) {
            res.status(400).json({ message: "System parameter already exists" });
            return;
        }

        const newParam = new SysConfigModel({ name, value });
        await newParam.save();

        res.status(201).json(newParam);

        // Firestore backup
        try {
            await firestore.collection("systemParameters").doc(name).set({ name, value });
            log.info(`createSystemParameter:: Firestore backup completed for ${name}`);
        } catch (firestoreError) {
            log.error(`createSystemParameter:: Firestore backup failed: ${firestoreError}`);
        }
    } catch (error: any) {
        log.error(`createSystemParameter:: error: ${error.message}`);
        res.status(500).json({ message: "Failed to create system parameter" });
    }
};

export const updateSystemParameter = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, value } = req.body;

        const cache = SysParaCache.getInstance();
        cache.del(name);

        console.log(req.body)
        if (value === undefined) {
            res.status(400).json({ message: "Value is required for update" });
            return;
        }

        const updatedParam = await SysConfigModel.findOneAndUpdate(
            { name },
            { value },
            { new: true }
        );

        if (!updatedParam) {
            res.status(404).json({ message: "System parameter not found" });
            return;
        }

        res.status(200).json(updatedParam);

        // Firestore backup
        try {
            await firestore.collection("systemParameters").doc(name).set({ name, value });
            log.info(`updateSystemParameter:: Firestore sync completed for ${name}`);
        } catch (firestoreError) {
            log.error(`updateSystemParameter:: Firestore sync failed: ${firestoreError}`);
        }
    } catch (error: any) {
        log.error(`updateSystemParameter:: error: ${error.message}`);
        res.status(500).json({ message: "Failed to update system parameter" });
    }
};

export const deleteSystemParameter = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;
        const deletedParam = await SysConfigModel.findOneAndDelete({ name });

        const cache = SysParaCache.getInstance();
        cache.del(name);

        if (!deletedParam) {
            res.status(404).json({ message: "System parameter not found" });
            return;
        }

        res.status(200).json({ message: `System parameter '${name}' deleted successfully` });

        // Firestore deletion
        try {
            await firestore.collection("systemParameters").doc(name).delete();
            log.info(`deleteSystemParameter:: Firestore document deleted for ${name}`);
        } catch (firestoreError) {
            log.error(`deleteSystemParameter:: Firestore deletion failed: ${firestoreError}`);
        }
    } catch (error: any) {
        log.error(`deleteSystemParameter:: error: ${error.message}`);
        res.status(500).json({ message: "Failed to delete system parameter" });
    }
};

