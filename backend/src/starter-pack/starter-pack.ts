import CuisineModel from "../models/cusine";
import ProductModel from "../models/product";
import User, { IUser } from "../models/user";
import { hashPassword } from "../utils/auth";
import log from "../utils/logger";
import products from "./products";
import orders from "./orders";
import OrderModel from "../models/order";

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
  const bulkOps = products.map(product => ({
    updateOne: {
      filter: { id: product.id },
      update: { $set: product },
      upsert: true,
    }
  }));

  ProductModel.bulkWrite(bulkOps)
    .then(() => console.log("Products added or updated successfully!"))
    .catch(err => console.error("Error inserting/updating products:", err));
};

const addCusines = async (): Promise<void> => {
  const bulkOps = getUniqueCuisines(products).map(cusine => ({
    updateOne: {
      filter: { name: cusine },
      update: { $set: { name: cusine, timestamp: Date.now() } },
      upsert: true,
    }
  }));

  CuisineModel.bulkWrite(bulkOps)
    .then(() => console.log("Cusines added or updated successfully!"))
    .catch(err => console.error("Error inserting/updating Cusines:", err));
};

const getUniqueCuisines = (products: any[]) => {
  const allCuisines = products.flatMap(product => product.cusine);
  const uniqueCuisines = [...new Set(allCuisines)];
  return uniqueCuisines;
};

const addOrders = async (): Promise<void> => {
  const bulkOps = orders.map(order => ({
    updateOne: {
      filter: { id: order.id },
      update: { $set: order },
      upsert: true,
    }
  }));

  OrderModel.bulkWrite(bulkOps)
    .then(() => console.log("Orders added or updated successfully!"))
    .catch(err => console.error("Error inserting/updating orders:", err));
};


const starterPack = async (): Promise<void> => {
  await addAdminUser();
  await addUser("lakshan1");
  await addUser("suren");
  await addProducts();
  await addCusines();
  await addOrders();
  log.info("starterPack added successfully");
};

export default starterPack;
