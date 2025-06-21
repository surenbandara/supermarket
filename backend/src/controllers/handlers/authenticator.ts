import e, { Request, Response } from "express";
import User, { IUser } from "../../models/user";
import { hashPassword, comparePassword, generateToken } from "../../utils/auth";
import log from "../../utils/logger";
import admin from "firebase-admin";

admin.initializeApp({
    credential: admin.credential.cert("./src/config/serviceAccountKey.json"),
    // databaseURL: "https://test01-a1349-default-rtdb.asia-southeast1.firebasedatabase.app",
    storageBucket: "supermarket-afm.firebasestorage.app"
});

export default admin;

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password, email, phoneNumber, address, profilePic } = req.body;

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            log.error(`register:: User with email ${email} is not exist`);
            res.status(400).json({ message: "User with this email is not exists" });
            return;
        }

        const user: IUser = {
            id: existingUser.id,
            email: email,
            role: existingUser.role,
        } as IUser;

        if (username !== undefined && username !== null && username !== "") {
            user.username = username;
        }
        if (password !== undefined && password !== null && password !== "") {
            user.password = await hashPassword(password);
        }
        if (phoneNumber !== undefined && phoneNumber !== null && phoneNumber !== "") {
            if (!/^\d{10}$/.test(phoneNumber)) {
                log.error(`register:: Invalid phone number format: ${phoneNumber}`);
                res.status(400).json({ message: "Invalid phone number format" });
                return;
            }
            user.phoneNumber = phoneNumber;
        }
        if (address !== undefined && address !== null && address !== "") {
            user.address = address;
        }
        if (profilePic !== undefined && profilePic !== null && profilePic !== "") {
            user.profilePic = profilePic;
        }

        await User.updateOne({ email: user.email }, user, { upsert: true });
        log.info(`register:: User ${username} updated successfully`);
        res.status(200).json({ message: "User updated successfully", phoneNumber:user.phoneNumber, address:user.address });

    } catch (error: any) {
        log.error(`register:: error: ${error.message}`);
        res.status(400).json({ message: "Failed to update User" });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, token, password } = req.body;
        const basicUserDetails: IUser = {} as IUser;
        let decodedToken = {} as any;
        let newUser: any = null;
        if (token !== undefined && token !== null && token !== "") {
            try {
                try {
                    decodedToken = await admin.auth().verifyIdToken(token);
                } catch (error) {
                    console.log(`login:: Error ${error} verifying token for user: ${email}`);
                    log.error(`login:: Error Invalid token verifying token for user: ${email}`);
                    res.status(401).json({ message: `Invalid token` });
                    return;
                }
                if (!decodedToken || !decodedToken.email) {
                    console.log(`login:: Error ${decodedToken} verifying token for user: ${email}`);
                    log.error(`login:: Error Invalid token verifying token for user: ${email}`);
                    res.status(401).json({ message: `Invalid token` });
                    return;
                }
                if (decodedToken.email !== email) {
                    log.error(`login:: Error Unathorized user token verifying token for user: ${email}`);
                    res.status(401).json({ message: `Invalid token` });
                    return;
                }
                basicUserDetails.id = decodedToken.uid;
                basicUserDetails.username = decodedToken?.name;
                basicUserDetails.email = decodedToken.email;
                basicUserDetails.role = "user";
                basicUserDetails.emailVerified = decodedToken.email_verified;
                // basicUserDetails.phoneNumber = decodedToken?.phone_number;
                basicUserDetails.profilePic = decodedToken?.picture;

            } catch (error: any) {
                log.error(`login:: Error ${error} verifying token for user: ${email}`);
                res.status(401).json({ message: `Invalid token ${error.message}` });
            }
        } else if (password !== undefined && password !== null && password !== "") {
            basicUserDetails.email = email;
            basicUserDetails.role = "admin";
            basicUserDetails.emailVerified = false;
        } else {
            log.error(`login:: Invalid request: ${JSON.stringify(req.body)}`);
            res.status(400).json({ message: "Invalid request" });
            return;
        }

        const user = (await User.findOne({ email: basicUserDetails.email }))?.toObject() as IUser;

        if (!user) {
            if (basicUserDetails.role === "user") {
                log.info(`login:: User with email ${basicUserDetails.email} not found`);
                newUser = new User(basicUserDetails);
                await newUser.save();
                log.info(`login:: New user ${basicUserDetails.email} created successfully`);
                res.status(201).json({ message: "User created successfully", jwtToken: generateToken(newUser.id, newUser.role), basicUserDetails: newUser.toJSON() });
                return;
            }
            else {
                log.error(`login:: admin with email ${basicUserDetails.email} is not existing`);
                res.status(400).json({ message: "Admin not existing" });
                return;
            }
        } else if (basicUserDetails.role === "admin") {
            if (user?.password === undefined || user?.password === null || user?.password === "") {
                log.error(`login:: empty password for admin ${basicUserDetails.email}`);
                res.status(400).json({ message: "Empty password" });
                return;
            }
            if (!await comparePassword(password, user?.password)) {
                log.error(`login:: Invalid password for user ${basicUserDetails.email}`);
                res.status(400).json({ message: "Invalid password" });
                return;
            }
            newUser = new User(basicUserDetails);
        } else if (basicUserDetails.role === "user") {
            log.info(`login:: User with email ${basicUserDetails.email} is found`);
            // newUser = new User(basicUserDetails);
            newUser = await User.findOneAndUpdate({ email: basicUserDetails.email }, basicUserDetails, { upsert: true, new: true });
        } else {
            log.error(`login:: User with email ${basicUserDetails.email} role is invalid`);
            res.status(400).json({ message: "User role invalid" });
            return;
        }

        const jwtToken = generateToken(basicUserDetails.id, basicUserDetails.role);
        log.info(`login:: User ${basicUserDetails.email} logged in successfully`);
        res.status(200).json({ jwtToken, basicUserDetails:newUser.toJSON() });
    }
    catch (error: any) {
        log.error(`login:: error: ${error.message}`);
        res.status(400).json({ message: "Failed to login" });
    }
};
