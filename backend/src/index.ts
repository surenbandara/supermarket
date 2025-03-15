import app from "./app";
import log from "./utils/logger";
import connectDB from "./utils/db";

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