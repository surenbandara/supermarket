import { Request, Response } from "express";
import * as handlers from "./handlers/products";
import * as authenticate from "./handlers/authenticator";

export default {

    login:authenticate.login,
    register:authenticate.register,
    listProducts: handlers.listProducts,
    createNewProduct: handlers.createNewProduct,
    updateProduct: handlers.updateProduct,
    deleteProduct: handlers.deleteProduct,
    filterProducts: handlers.filterProducts,

}