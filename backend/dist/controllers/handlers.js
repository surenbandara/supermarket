"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const productHandlers = __importStar(require("./handlers/products"));
const userHandlers = __importStar(require("./handlers/user"));
const vendorHandlers = __importStar(require("./handlers/vendor"));
const authenticate = __importStar(require("./handlers/authenticator"));
const shopHandlers = __importStar(require("./handlers/shop"));
const riderHandler = __importStar(require("./handlers/rider"));
exports.default = {
    login: authenticate.login,
    register: authenticate.register,
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
    deleteRider: riderHandler.deleteRider
};
