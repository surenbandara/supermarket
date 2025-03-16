import ProductModel from "../models/product";
import User, { IUser } from "../models/user";
import { hashPassword } from "../utils/auth";
import log from "../utils/logger";
import products from "./products";

const addAdminUser = async (): Promise<void> => {
    const adminUser: IUser = {
        id: new Date().toISOString(),
        username: "systemAdmin",
        password: await hashPassword("admin@123"),
        role: "admin",
        email: "systemAdmin@gmail.com",
        phoneNumber: "",
        profilePic: "",
        emailVerified: false
    } as IUser;
    if (await User.findOne({ email: adminUser.email })) {
        log.info("Admin user already exists");
        return;
    }
    const user = new User(adminUser);
    await user.save();
};

const addUser = async (name: string): Promise<void> => {
    const user1: IUser = {
        id: new Date().toISOString(),
        username: `${name}STPACK`,
        password: await hashPassword("userSTPACK@123"),
        role: "user",
        email: `${name}STPACK@gmail.com`,
        phoneNumber: "",
        profilePic: "",
        emailVerified: false
    } as IUser;
    if (await User.findOne({ email: user1.email })) {
        log.info(`Customer  ${name} user already exists`);
        return;
    }
    const user = new User(user1);
    await user.save();
};

const addProducts = async (): Promise<void> => {
    ProductModel.insertMany(products)
        .then(() => console.log("Products added successfully!"))
        .catch(err => console.error("Error inserting products:", err));
};

const starterPack = async (): Promise<void> => {
    await addAdminUser();
    await addUser("lakshan1");
    await addUser("suren");
    await addProducts();
    log.info("starterPack added successfully");
};

export default starterPack;
