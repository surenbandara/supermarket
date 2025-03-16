import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    id: string;
    username?: string;
    password?: string;
    role: string;
    email: string;
    phoneNumber?: string;
    profilePic?: string;
    emailVerified?: boolean;
}

const userSchema = new mongoose.Schema<IUser>(
    {
        id: { type: String, required: true },
        username: { type: String, required: false },
        password: { type: String, required: false },
        role: { type: String, required: true },
        email: { type: String, required: true },
        phoneNumber: { type: String, required: false },
        profilePic: { type: String, required: false },
        emailVerified: { type: Boolean, required: false, default: false }
    },
    {
        strict: true,
        timestamps: true,
    }
);

userSchema.index({ id: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ email: 1 }, { unique: true });

userSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.emailVerified;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
    },
});

userSchema.set('toObject', {
    transform: (doc, ret, options) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const UserModel = mongoose.model<IUser>("Users", userSchema);

export default UserModel;