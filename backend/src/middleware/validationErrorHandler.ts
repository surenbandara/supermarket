import { Request, Response, NextFunction } from 'express';
import log from '../utils/logger';

export const apiValidationHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof Error) {

        log.error("ERROR::apiValidationHandler: ", err);
        res.status(400).json({
            status: 400,
            message: err.message,
        });
    } else {
        next();
    }
};
