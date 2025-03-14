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
exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../../models/User"));
const auth_1 = require("../../utils/auth");
const logger_1 = __importDefault(require("../../utils/logger"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert("./src/config/serviceAccountKey.json"),
    // databaseURL: "https://test01-a1349-default-rtdb.asia-southeast1.firebasedatabase.app"
});
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, email, phoneNumber, profilePic } = req.body;
        const existingUser = yield User_1.default.findOne({ email });
        if (!existingUser) {
            logger_1.default.error(`register:: User with email ${email} is not exist`);
            res.status(400).json({ message: "User with this email is not exists" });
            return;
        }
        const user = {
            id: existingUser.id,
            email: email,
            role: existingUser.role,
        };
        if (username !== undefined && username !== null && username !== "") {
            user.username = username;
        }
        if (password !== undefined && password !== null && password !== "") {
            user.password = yield (0, auth_1.hashPassword)(password);
        }
        if (phoneNumber !== undefined && phoneNumber !== null && phoneNumber !== "") {
            user.phoneNumber = phoneNumber;
        }
        if (profilePic !== undefined && profilePic !== null && profilePic !== "") {
            user.profilePic = profilePic;
        }
        yield User_1.default.updateOne({ email: user.email }, user, { upsert: true });
        logger_1.default.info(`register:: User ${username} updated successfully`);
        res.status(200).json({ message: "User updated successfully" });
    }
    catch (error) {
        logger_1.default.error(`register:: error: ${error.message}`);
        res.status(400).json({ message: "Failed to update User" });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { email, token, password } = req.body;
        const basicUserDetails = {};
        let decodedToken = {};
        let newUser = null;
        if (token !== undefined && token !== null && token !== "") {
            try {
                try {
                    decodedToken = yield firebase_admin_1.default.auth().verifyIdToken(token);
                }
                catch (error) {
                    logger_1.default.error(`login:: Error Invalid token verifying token for user: ${email}`);
                    res.status(401).json({ message: `Invalid token` });
                    return;
                }
                if (!decodedToken || !decodedToken.email) {
                    logger_1.default.error(`login:: Error Invalid token verifying token for user: ${email}`);
                    res.status(401).json({ message: `Invalid token` });
                    return;
                }
                if (decodedToken.email !== email) {
                    logger_1.default.error(`login:: Error Unathorized user token verifying token for user: ${email}`);
                    res.status(401).json({ message: `Invalid token` });
                    return;
                }
                basicUserDetails.id = decodedToken.uid;
                basicUserDetails.username = decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.name;
                basicUserDetails.email = decodedToken.email;
                basicUserDetails.role = "user";
                basicUserDetails.emailVerified = decodedToken.email_verified;
                basicUserDetails.phoneNumber = decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.phone_number;
                basicUserDetails.profilePic = decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.picture;
            }
            catch (error) {
                logger_1.default.error(`login:: Error ${error} verifying token for user: ${email}`);
                res.status(401).json({ message: `Invalid token ${error.message}` });
            }
        }
        else if (password !== undefined && password !== null && password !== "") {
            basicUserDetails.email = email;
            basicUserDetails.role = "admin";
            basicUserDetails.emailVerified = false;
        }
        else {
            logger_1.default.error(`login:: Invalid request: ${JSON.stringify(req.body)}`);
            res.status(400).json({ message: "Invalid request" });
            return;
        }
        const user = (_a = (yield User_1.default.findOne({ email: basicUserDetails.email }))) === null || _a === void 0 ? void 0 : _a.toObject();
        if (!user) {
            if (basicUserDetails.role === "user") {
                logger_1.default.info(`login:: User with email ${basicUserDetails.email} not found`);
                newUser = new User_1.default(basicUserDetails);
                yield newUser.save();
                logger_1.default.info(`login:: New user ${basicUserDetails.email} created successfully`);
                res.status(201).json({ message: "User created successfully", jwtToken: (0, auth_1.generateToken)(newUser.id, newUser.role), basicUserDetails: newUser.toJSON() });
                return;
            }
            else {
                logger_1.default.error(`login:: admin with email ${basicUserDetails.email} is not existing`);
                res.status(400).json({ message: "Admin not existing" });
                return;
            }
        }
        else if (basicUserDetails.role === "admin") {
            if ((user === null || user === void 0 ? void 0 : user.password) === undefined || (user === null || user === void 0 ? void 0 : user.password) === null || (user === null || user === void 0 ? void 0 : user.password) === "") {
                logger_1.default.error(`login:: empty password for admin ${basicUserDetails.email}`);
                res.status(400).json({ message: "Empty password" });
                return;
            }
            if (!(yield (0, auth_1.comparePassword)(password, user === null || user === void 0 ? void 0 : user.password))) {
                logger_1.default.error(`login:: Invalid password for user ${basicUserDetails.email}`);
                res.status(400).json({ message: "Invalid password" });
                return;
            }
        }
        else if (basicUserDetails.role === "user") {
            logger_1.default.info(`login:: User with email ${basicUserDetails.email} is found`);
            newUser = new User_1.default(basicUserDetails);
            yield User_1.default.updateOne({ email: basicUserDetails.email }, basicUserDetails, { upsert: true });
        }
        else {
            logger_1.default.error(`login:: User with email ${basicUserDetails.email} role is invalid`);
            res.status(400).json({ message: "User role invalid" });
            return;
        }
        const jwtToken = (0, auth_1.generateToken)(basicUserDetails.id, basicUserDetails.role);
        logger_1.default.info(`login:: User ${basicUserDetails.email} logged in successfully`);
        res.status(200).json({ jwtToken, basicUserDetails: newUser.toJSON() });
    }
    catch (error) {
        logger_1.default.error(`login:: error: ${error.message}`);
        res.status(400).json({ message: "Failed to login" });
    }
});
exports.login = login;
