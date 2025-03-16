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
        product.id = Date.now();
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
    try {
        const { name, priceRange, quantityRange, cusine, brand, shop, discount, timestampRange, limit = 10, page = 1 } = req.body;
        const filter = {};
        if (name)
            filter.name = { $regex: new RegExp(name, "i") };
        if ((priceRange === null || priceRange === void 0 ? void 0 : priceRange.min) !== undefined || (priceRange === null || priceRange === void 0 ? void 0 : priceRange.max) !== undefined) {
            filter.price = {};
            if (priceRange.min !== undefined)
                filter.price.$gte = priceRange.min;
            if (priceRange.max !== undefined)
                filter.price.$lte = priceRange.max;
        }
        if ((quantityRange === null || quantityRange === void 0 ? void 0 : quantityRange.min) !== undefined || (quantityRange === null || quantityRange === void 0 ? void 0 : quantityRange.max) !== undefined) {
            filter.quantity = {};
            if (quantityRange.min !== undefined)
                filter.quantity.$gte = quantityRange.min;
            if (quantityRange.max !== undefined)
                filter.quantity.$lte = quantityRange.max;
        }
        if (cusine && cusine.length > 0)
            filter.cusine = { $in: cusine }; // Matches any in the array
        if (brand)
            filter.brand = brand;
        if (shop)
            filter.shop = shop;
        if (discount !== undefined)
            filter.discount = discount;
        if ((timestampRange === null || timestampRange === void 0 ? void 0 : timestampRange.start) !== undefined || (timestampRange === null || timestampRange === void 0 ? void 0 : timestampRange.end) !== undefined) {
            filter.timestamp = {};
            if (timestampRange.start !== undefined)
                filter.timestamp.$gte = timestampRange.start;
            if (timestampRange.end !== undefined)
                filter.timestamp.$lte = timestampRange.end;
        }
        const products = yield product_1.default.find(filter)
            .sort({ timestamp: -1 }); // Sort by latest products
        // .skip((page - 1) * limit)
        // .limit(limit);
        logger_1.default.info(`filterProducts::Products fetched successfully`);
        res.status(200).json(products);
    }
    catch (err) {
        logger_1.default.error(`filterProducts:: ${err.message}`);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
    next();
});
exports.filterProducts = filterProducts;
