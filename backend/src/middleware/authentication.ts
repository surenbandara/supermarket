import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import log from "../utils/logger";

dotenv.config();

const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {

    const token = req.header("authorization")?.split(" ")[1];
    if (!token) {
        log.error("authenticateJWT:: No token provided");
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string, role: string };
        // log.info(`authenticateJWT:: User authenticated with id: ${decoded}`);
        req.authResult = decoded;
        next();
    } catch (error: any) {
        log.error(`authenticateJWT:: ${error.message}`);
        res.status(401).json({ message: "Unauthorized" });
    }
};

const authorizeJWT = (req: Request, res: Response, next: NextFunction): void => {
    const role = req.authResult?.role;

    const allowedRoles = req.openapi?.schema?.["x-roles"] ?? [];
    if (role && allowedRoles.length !== 0 && !allowedRoles.includes(role)) {
        log.error(`authorizeJWT:: User not authorized with role: ${role}`);
        res.status(401).json({ message: "Not Allowed" });
        return;
    }
    // log.info(`authorizeJWT:: User:${req.authResult?.id} authorized with role: ${role}`);
    next();
};

const authValidation = (req: Request, res: Response, next: NextFunction): void => {

    const openRoutes = ["/login"];
    if (openRoutes.includes(req.path)) {
        next();
        return;
    }

    authenticateJWT(req, res, () => {
        authorizeJWT(req, res, next);
    });
};

export default authValidation;