import mongoose from "mongoose";

export interface IRider extends mongoose.Document {
    id: string;
    username: string;
    email: string;
    phoneNumber?: string;
    profilePic?: string;
    // TODO: Add availability if needed
}
const riderSchema = new mongoose.Schema<IRider>(
    {
        id: { type: String, required: true },
        username: { type: String, required: true },
        email: { type: String, required: true },
        phoneNumber: { type: String, required: false },
        profilePic: { type: String, required: false }
    },
    {
        strict: true,
        timestamps: true,
    }
);

riderSchema.index({ id: 1 }, { unique: true });
riderSchema.index({ email: 1 }, { unique: true });

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