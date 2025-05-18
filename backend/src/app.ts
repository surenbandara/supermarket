import express from "express";
import * as yaml from "js-yaml";
import * as fs from "fs";
import swaggerUi from "swagger-ui-express";
import * as OpenApiValidator from 'express-openapi-validator';
import cors from "cors";

import { apiValidationHandler } from "./middleware/validationErrorHandler";
import { operationHandler } from "./middleware/operationHandler";
import authValidation from "./middleware/authentication";

import starterPack from "./starter-pack/starter-pack";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors({
    origin: ["http://localhost:3001", "http://localhost:37253"],  // Allow your frontend domain
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],  // REMOVE 'Access-Control-Allow-Credentials'
    credentials: true
}));

app.options("*", (req, res) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3001");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    res.sendStatus(204);
});


const apiSpec = yaml.load(fs.readFileSync("./src/api.yaml", "utf8")) as any;
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(apiSpec));

app.use(
    OpenApiValidator.middleware({
        apiSpec,
        validateRequests: false,
        validateResponses: true,
    })
);
starterPack();
app.use(authValidation);
app.use(operationHandler);
app.use(apiValidationHandler);

export default app;