import { Category, Shop, AdditionalData } from "./common";
import mongoose from "mongoose";

export interface IProduct extends mongoose.Document {
    id: number;
    name: string;
    price: number;
    quantity: number;
    category: Category; //TODO: need mechanism to add new categories(shops) to Enum
    brand: string;
    shop: Shop;
    image?: string;
    discount?: number;
    timestamp: number;
    additionalData?: AdditionalData;
}

const productSchema = new mongoose.Schema<IProduct>(
    {
        id: { type: Number, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        category: { type: String, required: true },
        brand: { type: String, required: true },
        shop: { type: String, required: true },
        image: { type: String, required: false },
        discount: { type: Number, required: false },
        timestamp: { type: Number, required: true },
        additionalData: { type: Object, required: false },
    },
    {
        strict: true,
        timestamps: true,
    }
);

productSchema.index({ id: 1 }, { unique: true }); 
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ timestamp: -1 });

productSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

productSchema.set('toObject', {
    transform: (doc, ret, options) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const ProductModel = mongoose.model<IProduct>("Products", productSchema);

export default ProductModel;