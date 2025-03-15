"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("../utils/logger"));
dotenv_1.default.config();
const authenticateJWT = (req, res, next) => {
    var _a;
    const token = (_a = req.header("authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        logger_1.default.error("authenticateJWT:: No token provided");
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // log.info(`authenticateJWT:: User authenticated with id: ${decoded}`);
        req.authResult = decoded;
        next();
    }
    catch (error) {
        logger_1.default.error(`authenticateJWT:: ${error.message}`);
        res.status(401).json({ message: "Unauthorized" });
    }
};
const authorizeJWT = (req, res, next) => {
    var _a, _b, _c, _d;
    const role = (_a = req.authResult) === null || _a === void 0 ? void 0 : _a.role;
    const allowedRoles = (_d = (_c = (_b = req.openapi) === null || _b === void 0 ? void 0 : _b.schema) === null || _c === void 0 ? void 0 : _c["x-roles"]) !== null && _d !== void 0 ? _d : [];
    if (role && allowedRoles.length !== 0 && !allowedRoles.includes(role)) {
        logger_1.default.error(`authorizeJWT:: User not authorized with role: ${role}`);
        res.status(401).json({ message: "Not Allowed" });
        return;
    }
    // log.info(`authorizeJWT:: User:${req.authResult?.id} authorized with role: ${role}`);
    next();
};
const authValidation = (req, res, next) => {
    const openRoutes = ["/login"];
    if (openRoutes.includes(req.path)) {
        next();
        return;
    }
    authenticateJWT(req, res, () => {
        authorizeJWT(req, res, next);
    });
};
exports.default = authValidation;
