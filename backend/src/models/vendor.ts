import { Category, Shop, AdditionalData } from "./common";
import mongoose from "mongoose";

export interface IVendor extends mongoose.Document {
    // id: number;
    name: string;
    email: string;
    shopList: string[];
    timestamp: number;
    image?: string;
    additionalData?: string;
}
const vendorSchema = new mongoose.Schema<IVendor>(
    {
        // id: { type: Number, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        shopList: { type: [String], required: true },
        image: { type: String, required: false },
        timestamp: { type: Number, required: true },
        additionalData: { type: String, required: false },
    },
    {
        strict: true,
        timestamps: true,
    }
);

vendorSchema.index({ name: 1 }, { unique: true });
vendorSchema.index({ email: 1 }, { unique: true });
vendorSchema.index({ timestamp: -1 });

vendorSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        delete ret._id;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
    },
});

vendorSchema.set('toObject', {
    transform: (doc, ret, options) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const VendorModel = mongoose.model<IVendor>("Vendors", vendorSchema);

export default VendorModel;