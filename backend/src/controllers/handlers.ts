import { Request, Response } from "express";
import * as productHandlers from "./handlers/products";
import * as userHandlers from "./handlers/user";
import * as authenticate from "./handlers/authenticator";

export default {

    login:authenticate.login,
    register:authenticate.register,
    listProducts: productHandlers.listProducts,
    createNewProduct: productHandlers.createNewProduct,
    updateProduct: productHandlers.updateProduct,
    deleteProduct: productHandlers.deleteProduct,
    filterProducts: productHandlers.filterProducts,
    listUsers: userHandlers.listUsers

}