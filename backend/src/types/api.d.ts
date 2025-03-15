import { Request } from 'express';

declare module 'express' {
    interface Request {
        openapi?: {
            schema?: {
                operationId: string;
                'x-roles': string[];
            };
        };
        authResult?: {
            id: number;
            role: string;
        };
    }
}