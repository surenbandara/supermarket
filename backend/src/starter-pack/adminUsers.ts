import User, { IUser } from "../models/user";
import { hashPassword } from "../utils/auth";
import log from "../utils/logger";


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



const starterPack = async (): Promise<void> => {
    await addAdminUser();
    log.info("starterPack added successfully");
};

export default starterPack;
