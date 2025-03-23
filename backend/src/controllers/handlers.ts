import { Request, Response } from "express";
import * as productHandlers from "./handlers/products";
import * as userHandlers from "./handlers/user";
import * as vendorHandlers from "./handlers/vendor";
import * as authenticate from "./handlers/authenticator";
import * as shopHandlers from "./handlers/shop";
import * as riderHandler from "./handlers/rider";
import * as cusineHandler from "./handlers/cusine";
import * as sysParaHandler from "./handlers/sys-parameter";
import * as orderHandler from "./handlers/order";


export default {

    login:authenticate.login,
    register:authenticate.register,
    listProducts: productHandlers.listProducts,
    createNewProduct: productHandlers.createNewProduct,
    updateProduct: productHandlers.updateProduct,
    deleteProduct: productHandlers.deleteProduct,
    filterProducts: productHandlers.filterProducts,
    listUsers: userHandlers.listUsers,
    listVendors: vendorHandlers.listVendors,
    createNewVendor: vendorHandlers.createNewVendor,
    updateVendor: vendorHandlers.updateVendor,
    deleteVendor: vendorHandlers.deleteVendor,
    listShops: shopHandlers.listShops,
    createNewShop: shopHandlers.createNewShop,
    updateShop: shopHandlers.updateShop,
    deleteShop: shopHandlers.deleteShop,
    listRiders: riderHandler.listRiders,
    createNewRider: riderHandler.createNewRider,
    updateRider: riderHandler.updateRider,
    deleteRider: riderHandler.deleteRider,
    listCusines: cusineHandler.listCusines,
    createNewCusine: cusineHandler.createNewCusine,
    updateCusine: cusineHandler.updateCusine,
    deleteCusine: cusineHandler.deleteCusine,
    listSystemParameters: sysParaHandler.listSystemParameters,
    createSystemParameter: sysParaHandler.createSystemParameter,
    updateSystemParameter: sysParaHandler.updateSystemParameter,
    deleteSystemParameter: sysParaHandler.deleteSystemParameter,
    listOrders: orderHandler.listOrders,
    requestNewOrder: orderHandler.requestNewOrder,
    confirmOrder: orderHandler.confirmOrder,
    cancelOrder: orderHandler.cancelOrder

}