"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("../models/user"));
const auth_1 = require("../utils/auth");
const logger_1 = __importDefault(require("../utils/logger"));
const addAdminUser = () => __awaiter(void 0, void 0, void 0, function* () {
    const adminUser = {
        id: new Date().toISOString(),
        username: "systemAdmin",
        password: yield (0, auth_1.hashPassword)("admin@123"),
        role: "admin",
        email: "systemAdmin@gmail.com",
        phoneNumber: "",
        profilePic: "",
        emailVerified: false
    };
    if (yield user_1.default.findOne({ email: adminUser.email })) {
        logger_1.default.info("Admin user already exists");
        return;
    }
    const user = new user_1.default(adminUser);
    yield user.save();
});
const addUser = (name) => __awaiter(void 0, void 0, void 0, function* () {
    const user1 = {
        id: new Date().toISOString(),
        username: `${name}STPACK`,
        password: yield (0, auth_1.hashPassword)("userSTPACK@123"),
        role: "user",
        email: `${name}STPACK@gmail.com`,
        phoneNumber: "",
        profilePic: "",
        emailVerified: false
    };
    if (yield user_1.default.findOne({ email: user1.email })) {
        logger_1.default.info(`Customer  ${name} user already exists`);
        return;
    }
    const user = new user_1.default(user1);
    yield user.save();
});
const starterPack = () => __awaiter(void 0, void 0, void 0, function* () {
    yield addAdminUser();
    yield addUser("lakshan1");
    yield addUser("suren");
    logger_1.default.info("starterPack added successfully");
});
exports.default = starterPack;
