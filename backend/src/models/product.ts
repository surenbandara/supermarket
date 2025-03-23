import { Category, Shop, AdditionalData } from "./common";
import mongoose from "mongoose";

export interface IProduct extends mongoose.Document {
    id: number;
    name: string;
    price: number;
    quantity: number;
    cusine: string[];
    brand: string;
    shop: string;
    image?: string;
    discount?: number;
    timestamp: number;
    additionalData?: object;
}

const productSchema = new mongoose.Schema<IProduct>(
    {
        id: { type: Number, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        cusine: { type: [String], required: true },
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
productSchema.index({ name: 1 });
productSchema.index({ price: 1 });
productSchema.index({ shop: 1 });
productSchema.index({ cusine: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ discount: 1 });

productSchema.index({ timestamp: -1 });

productSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        delete ret._id;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
    },
});

productSchema.set('toObject', {
    transform: (doc, ret, options) => {
        delete ret._id;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
    },
});

const ProductModel = mongoose.model<IProduct>("Products", productSchema);

export default ProductModel;