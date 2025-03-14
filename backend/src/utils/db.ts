import mongoose from "mongoose";
import log from "./logger";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/test-super-market";

const connectDB = async () => {
    try {
        log.info(`MongoDB ::::: ${MONGO_URI}`);
        await mongoose.connect(MONGO_URI);
        log.info("MongoDB connected");
    } catch (err: any) {
        log.error("ERROR::connectDB: ", err);
    }
}

export default connectDB;