"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true },
    username: { type: String, required: false },
    password: { type: String, required: false },
    role: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: false },
    profilePic: { type: String, required: false },
    emailVerified: { type: Boolean, required: false, default: false }
}, {
    strict: true,
    timestamps: true,
});
userSchema.index({ id: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ email: 1 }, { unique: true });
userSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.emailVerified;
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
const UserModel = mongoose_1.default.model("User", userSchema);
exports.default = UserModel;
