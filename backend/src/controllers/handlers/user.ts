import e, { Request, Response, NextFunction } from 'express';
import UserModel, { IUser } from '../../models/user';
import log from '../../utils/logger';

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { role } = req.query;
        const filter = role ? { role } : {};
        const users: IUser[] = await UserModel.find(filter);

        // const page = parseInt(req.query.page as string) || 1;
        // const limit = parseInt(req.query.limit as string) || 10;
        // const startIndex = (page - 1) * limit;
        // const endIndex = page * limit;

        // const paginatedUsers = users.slice(startIndex, endIndex);

        // res.status(200).json({
        //     page,
        //     limit,
        //     totalUsers: users.length,
        //     totalPages: Math.ceil(users.length / limit),
        //     users: paginatedUsers,
        // });

        const userModels = users.map(user => new UserModel(user));
        const userJson = userModels.map(userModel => userModel.toJSON());
        log.info(`listUsers::Users fetched successfully: ${JSON.stringify(userJson)}`);
        res.status(200).json(userJson);
    }
    catch (err: any) {
        log.error(`listUsers:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
};


export const filterUser = async (req: Request, res: Response, next: NextFunction) => {
    // try {

    //     res.status(200).json(products);
    // }
    // catch (err: any) {
    //     console.log("ERROR::filterProducts: ", err);
    //     res.status(500).json({
    //         status: 500,
    //         message: "Internal Server Error",
    //     });
    // }
    next();
};
