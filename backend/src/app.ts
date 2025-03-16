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
app.use(express.json());
app.use(cors());

const apiSpec = yaml.load(fs.readFileSync("./src/api.yaml", "utf8")) as any;
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(apiSpec));

app.use(
    OpenApiValidator.middleware({
        apiSpec,
        validateRequests: true,
        validateResponses: true,
    })
);
starterPack();
app.use(authValidation);
app.use(operationHandler);
app.use(apiValidationHandler);

export default app;