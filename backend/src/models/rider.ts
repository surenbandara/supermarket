import mongoose from "mongoose";

export interface IRider extends mongoose.Document {
    name: string;
    email: string;
    phoneNumber: string;
    vehicle: string;
    available: boolean; 
}

const riderSchema = new mongoose.Schema<IRider>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        vehicle: { type: String, required: true },
        available: { type: Boolean, required: true }
    },
    {
        strict: true,
        timestamps: true,
    }
);

riderSchema.index({ name: 1 }, { unique: true });

riderSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

riderSchema.set('toObject', {
    transform: (doc, ret, options) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const RiderModel = mongoose.model<IRider>("Riders", riderSchema);

export default RiderModel;