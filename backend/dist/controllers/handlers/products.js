"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterProducts = exports.deleteProduct = exports.updateProduct = exports.createNewProduct = exports.listProducts = void 0;
const product_1 = __importDefault(require("../../models/product"));
const logger_1 = __importDefault(require("../../utils/logger"));
const listProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield product_1.default.find();
        logger_1.default.info(`listProducts::Products fetched successfully : ${products}`);
        res.status(200).json(products);
    }
    catch (err) {
        logger_1.default.error(`listProducts:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
});
exports.listProducts = listProducts;
const createNewProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = new product_1.default(req.body);
        yield product.save();
        logger_1.default.info(`createNewProduct::Product created successfully : ${product}`);
        res.status(201).json(product);
    }
    catch (err) {
        logger_1.default.error(`createNewProduct:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
});
exports.createNewProduct = createNewProduct;
const updateProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = req.body;
        const productId = req.body.id;
        const updateData = req.body;
        const updatedProduct = yield product_1.default.findOneAndUpdate({ id: Number(productId) }, updateData, { new: true, runValidators: true });
        if (!updatedProduct) {
            logger_1.default.error(`updateProduct::Product not found : ${productId}`);
            return res.status(404).json({ message: "Product not found" });
        }
        logger_1.default.info(`updateProduct::Product updated successfully : ${updatedProduct}`);
        res.status(200).json(updatedProduct);
    }
    catch (err) {
        logger_1.default.error(`updateProduct:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = req.body.id;
        const deletedProduct = yield product_1.default.findOneAndDelete({ id: Number(productId) });
        if (!deletedProduct) {
            logger_1.default.error(`deleteProduct::Product not found : ${productId}`);
            return res.status(404).json({ message: "Product not found" });
        }
        logger_1.default.info(`deleteProduct::Product deleted successfully : ${deletedProduct}`);
        res.status(200).json({
            status: 200,
            message: `Product with id ${productId} deleted successfully`,
        });
    }
    catch (err) {
        logger_1.default.error(`deleteProduct:: ${err}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
});
exports.deleteProduct = deleteProduct;
const filterProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.filterProducts = filterProducts;
