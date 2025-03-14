import { Request, Response, NextFunction } from "express";
import handlers from "../controllers/handlers";
import log from "../utils/logger";

export const operationHandler = async (req: Request, res: Response, next: NextFunction) => {

    const operationId = req.openapi?.schema?.operationId;

    if (!operationId) {
        res.status(404).json({
            status: 404,
            message: "Not Found",
        });
        log.error("ERROR::operationHandler: No operationId found for this request ", req);
        return;
    }

    const handler = (handlers as any)[operationId];

    if (handler) {
        await handler(req, res, next);
    } else {
        res.status(404).json({
            status: 404,
            message: "Not Found",
        });
        log.error("ERROR::operationHandler: No handler found for this operationId ", operationId);
    }
    return;
}