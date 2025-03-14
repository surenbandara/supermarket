"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.operationHandler = void 0;
const handlers_1 = __importDefault(require("../controllers/handlers"));
const logger_1 = __importDefault(require("../utils/logger"));
const operationHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const operationId = (_b = (_a = req.openapi) === null || _a === void 0 ? void 0 : _a.schema) === null || _b === void 0 ? void 0 : _b.operationId;
    if (!operationId) {
        res.status(404).json({
            status: 404,
            message: "Not Found",
        });
        logger_1.default.error("ERROR::operationHandler: No operationId found for this request ", req);
        return;
    }
    const handler = handlers_1.default[operationId];
    if (handler) {
        yield handler(req, res, next);
    }
    else {
        res.status(404).json({
            status: 404,
            message: "Not Found",
        });
        logger_1.default.error("ERROR::operationHandler: No handler found for this operationId ", operationId);
    }
    return;
});
exports.operationHandler = operationHandler;
