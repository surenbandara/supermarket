import { Category, Shop, AdditionalData, OrderStatus, PaymentMethod, PaymentStatus, PriceBag } from "./common";
import mongoose from "mongoose";


export interface Oder {
    id: number;
    productList: PriceBag[];
    totalPrice: number;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    userId: string;
    userLocation: string;
    discount?: number;
    timestamp: number;
}
export interface IOder extends mongoose.Document {
    id: number;
    bill: string;
    totalPrice: number;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    userId: string;
    userLocation: string;
    discount?: number;
    timestamp: number;
}

const orderSchema = new mongoose.Schema<IOder>(
    {
        id: { type: Number, required: true },
        bill: { type: String, required: true },
        totalPrice: { type: Number, required: true },
        status: { type: String, enum: Object.values(OrderStatus), required: true },
        paymentMethod: { type: String, enum: Object.values(PaymentMethod), required: true },
        paymentStatus: { type: String, enum: Object.values(PaymentStatus), required: true },
        userId: { type: String, required: true },
        userLocation: { type: String, required: true },
        discount: { type: Number, required: false },
        timestamp: { type: Number, required: true }
    },
    {
        strict: true,
        timestamps: true,
    }
);

orderSchema.index({ id: 1 }, { unique: true });
orderSchema.index({ status: 1 });
orderSchema.index({ totalPrice: 1 });
orderSchema.index({ timestamp: -1 });

orderSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

orderSchema.set('toObject', {
    transform: (doc, ret, options) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const OrderModel = mongoose.model<IOder>("Orders", orderSchema);

export default OrderModel;