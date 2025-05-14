import app from "./app";
import log from "./utils/logger";
import connectDB from "./utils/db";

import cron from 'node-cron';
import { backupProducts } from './controllers/handlers/products';

import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 3000;

const startServer = async () => {
    await connectDB();

    app.listen(port, () => {
        log.info(`Server running on port ${port}`);
    });
};

startServer();

// Run every day at 12:00 PM
cron.schedule('0 0 * * *', async () => {
// cron.schedule('*/5 * * * *', async () => {
    log.info('Scheduled job started: Product Firestore backup');
    try {
        await backupProducts();
        log.info('Scheduled job completed: Product Firestore backup');
    } catch (error) {
        log.error(`Scheduled job failed: ${error}`);
    }
  });
