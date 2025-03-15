"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiValidationHandler = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const apiValidationHandler = (err, req, res, next) => {
    if (err instanceof Error) {
        logger_1.default.error("ERROR::apiValidationHandler: ", err);
        res.status(400).json({
            status: 400,
            message: err.message,
        });
    }
    else {
        next();
    }
};
exports.apiValidationHandler = apiValidationHandler;
