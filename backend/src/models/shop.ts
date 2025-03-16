import { Category, Shop, AdditionalData } from "./common";
import mongoose from "mongoose";

export interface IShop extends mongoose.Document {
    // id: number;
    name: string;
    vendorName: string;
    productsList : number[];
    timestamp: number;
    image?: string;
    additionalData?: string;
}

const shopSchema = new mongoose.Schema<IShop>(
    {
        // id: { type: Number, required: true },
        name: { type: String, required: true },
        vendorName: { type: String, required: true },
        productsList: { type: [Number], required: true },
        timestamp: { type: Number, required: true },
        image: { type: String, required: false },
        additionalData: { type: String, required: false },
    },
    {
        strict: true,
        timestamps: true,
    }
);

shopSchema.index({ name: 1 }, { unique: true });
shopSchema.index({ vendorName: 1 });
shopSchema.index({ timestamp: -1 });

shopSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

shopSchema.set('toObject', {
    transform: (doc, ret, options) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const ShopModel = mongoose.model<IShop>("Shops", shopSchema);

export default ShopModel;