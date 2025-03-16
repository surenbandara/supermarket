import mongoose from "mongoose";

export interface ICuisine extends mongoose.Document {
    name: string;
    timestamp: number;
}

const cuisineSchema = new mongoose.Schema<ICuisine>(
    {
        name: { type: String, required: true, unique: true },
        timestamp: { type: Number, required: true },
    },
    {
        strict: true,
        timestamps: true,
    }
);

cuisineSchema.index({ name: 1 }, { unique: true });
cuisineSchema.index({ timestamp: -1 });

cuisineSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        delete ret._id;
        delete ret.__v;        
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
    },
});

cuisineSchema.set('toObject', {
    transform: (doc, ret, options) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const CuisineModel = mongoose.model<ICuisine>("Cuisines", cuisineSchema);

export default CuisineModel;
