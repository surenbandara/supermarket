// RestaurantManager.ts
import NetInfo from "@react-native-community/netinfo";
import { useRestApi } from ".";
import { restaurant } from "../../apollo/queries";
import { RestApiClient } from './RestApiClient';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import auth from '@react-native-firebase/auth';
import { ToastAndroid } from "react-native";
import * as Notifications from 'expo-notifications'

class RestaurantManager {
  static instance;
  shopData = [];
  productData = [];
  systemParameters = [];
  orders = [];
  loading = false;
  error = null;
  networkStatus = false;
  apiClient;
  fireBaseConfig = {
    webClientId: '992013307518-j4veri5p3gr28kaf6ghethq1cvv7g7ql.apps.googleusercontent.com',
  }
  token = null;
  user = null;
  listeners = [];

  constructor() {
    this.apiClient = new RestApiClient(this.token);
    NetInfo.addEventListener((state) => {
      this.networkStatus = state.isConnected ?? false;
    });
  }

  static getInstance() {
    console.log('RestaurantManager instance requested');
    if (!RestaurantManager.instance) {
      RestaurantManager.instance = new RestaurantManager();
      RestaurantManager.instance.fetchAll();
    }
    return RestaurantManager.instance;
  }

  async login(email, idToken) {
    console.log("Logging in with email:", email);
    try {
      const data = await this.apiClient.query("LOGIN", "POST", {"email": email, "token": idToken});
      ToastAndroid.showWithGravity(
        `Login is Successfull `,
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      )
      this.user = data.basicUserDetails
      this.token = data.jwtToken;
      console.log("Login successful:", this.user);
      console.log("Token received:", this.token);
      this.apiClient.setToken(this.token);
    } catch (err) {
      ToastAndroid.showWithGravity(
        `Login Failed`,
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      )
      this.error = err;
    } 
  
  }

  notifyChange() {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }


  logout() {
    this.token = null;
    this.user = null;
    this.apiClient.setToken(this.token);
    this.shopData = [];
    this.productData = [];
    this.systemParameters = [];
  }

  getShopData() {
    return this.shopData;
  }

  getOrders() {
    return this.orders;
  }

  getProductData() {
    return this.productData;
  }

  getSystemParameters() {
    return this.systemParameters;
  }

  getSystemParameterFromKey(key) {
    const filteredParameters = this.systemParameters.find((parameters) => parameters.name == key);
    return  filteredParameters;
  }

  getProductDataFromName(name) {
    const filteredProducts = this.productData.find((product) => product.name == name);
    return filteredProducts;
  }

  getProductDataFromId(id) {
    const filteredProducts = this.productData.find((product) => product.id == id);
    return filteredProducts;
  }

  getShopDataFromName(name) {
    const filteredShops = this.shopData.find((shop) => shop.name == name);
    return filteredShops;
  }

  getProductDataForStore(name) {
    const filteredProducts = this.productData.filter((product) => product.shop == name);
    return filteredProducts;
  }

  getOrderByStatus(status) {
    if (status.length == 0) {
      return this.orders;
    }
    const filteredOrders = this.orders.filter((order) => status.includes(order.status));
    return filteredOrders;
  }

  getLoading() {
    return this.loading;
  }

  getError() {
    return this.error;
  }

  getNetworkStatus() {
    return this.networkStatus;
  }

  checkStatusUpdates(oldOrders, newOrders) {
    const statusMessages = {
      INITIATED: "Your order has been initiated. The seller has acknowledged your order.",
      CONFIRMED: "Your order has been confirmed. It will be prepared soon.",
      PROCESSING: "Your order is now being processed.",
      SHIPPED: "Your order has been shipped and is on the way.",
      DELIVERED: "Your order has been delivered. Please check your items.",
      COMPLETED: "Your order has been completed. Thank you for shopping!",
      CANCELLED: "Your order has been cancelled.",
      RETURNED: "Your order has been returned successfully.",
    };
  
    newOrders.forEach((newOrder) => {
      const oldOrder = oldOrders.find(o => o.id == newOrder.id);
      if (oldOrder && oldOrder.status != newOrder.status) {
        const newStatus = newOrder.status;
        if (newStatus === 'NEW') return;
  
        const message = statusMessages[newStatus];
        //if (!message) return;
        Notifications.scheduleNotificationAsync({
          content: {
            title: `Order #${newOrder.id} Update`,
            body: message,
            data: { _id: newOrder.id }
          },
          trigger: { seconds: 1 },
        });
      }
    });
  }
  

  async fetchOrders() {
    if (this.user !== null) {
      this.refetchOrders(false);
      this.notifyChange();
    }
  }

  async fetchAll() {
    await this.refetchProducts(false);
    await this.refetchShop(false);
    await this.refetchSystemParamteres(false);
    await this.refetchOrders(false);
    // console.log("Shop data:", this.shopData);
    // console.log("Product data:", this.productData);
    //console.log("Orders:", this.orders);
  }

  async submitOrder(order) {
    try {
      this.loading = true;
      const data = await this.apiClient.query("GET_ORDERS", "POST", order);
      this.loading = false;
      return {status: true, payload:data};
    } catch (err) {
      this.error = err;
      this.loading = false;
      return {status: false, error: err};
    } 
  }

  async editOrder(order) {
    try {
      this.loading = true;
      const data = await this.apiClient.query("GET_ORDERS", "PUT", order);
      await this.refetchOrders(false);
      this.loading = false;
      return {status: true, payload:data};
    } catch (err) {
      this.error = err;
      this.loading = false;
      return {status: false, error: err};
    } finally { 
      this.loading = false;
    }
  }

  async cacelOrder(order) {
    try {
      this.loading = true;
      const data = await this.apiClient.query("GET_ORDERS", "DELETE", order);
      await this.refetchOrders(false);
      this.loading = false;
      return {status: true, payload:data};
    } catch (err) {
      this.error = err;
      console.log('Error cancelling order:', err);
      this.loading = false;
      return {status: false, error: err};
    } finally { 
      this.loading = false;
    }
  }

  async refetchOrders(loadingEnable = true) {
   
    try {
      if (loadingEnable) {
        this.loading = true;
      }
      const data = await this.apiClient.query("GET_ORDERS", "GET", {"userId": this.user.id});

      const updatedOrders = data.map((item, index) => {
        const totalPrice = JSON.parse(item.totalPrice);
        const bills = JSON.parse(item.bill);
        const bill = bills.map((item) => {
          const product = this.getProductDataFromId(item.productId);
          item.product = product;
          return item;
        });

        item.bill = bill;
        item.totalPrice = totalPrice;
        item.shop = this.getShopDataFromName(item.bill[0].product?.shop);
        return item;
      });

      this.checkStatusUpdates(this.orders, updatedOrders);
      this.orders = updatedOrders;
      
    } catch (err) {
      this.error = err;
    } finally {
      if (loadingEnable) {
        this.loading = false;
      }
    }
  }


  async refetchSystemParamteres(loadingEnable = true) {
    try {
      if (loadingEnable) {
        this.loading = true;
      }
      const data = await this.apiClient.query("GET_SYSTEM_PARAMETERS")
      this.systemParameters = data;
    } catch (err) {
      this.error = err;
    } finally {
      if (loadingEnable) {
        this.loading = false;
      }
    }
  }

  async refetchSystemParamteres(loadingEnable = true) {
    try {
      if (loadingEnable) {
        this.loading = true;
      }
      const data = await this.apiClient.query("GET_SYSTEM_PARAMETERS")
      this.systemParameters = data;
    } catch (err) {
      this.error = err;
    } finally {
      if (loadingEnable) {
        this.loading = false;
      }
    }
  }

  async refetchProducts(loadingEnable = true) {
    try {
      if (loadingEnable) {
        this.loading = true;
      }
      const data = await this.apiClient.query("GET_PRODUCTS");
      const updatedProducts = data.map((item, index) => {
        // item.image =
        //   "https://fastly.picsum.photos/id/870/200/300.jpg?blur=2&grayscale&hmac=ujRymp644uYVjdKJM7kyLDSsrqNSMVRPnGU99cKl6Vs";
        item.isAvailable = true;
        item.description = item.brand;
        item.title = item.name;
        return item;
      });
      this.productData = updatedProducts;
    } catch (err) {
      this.error = err;
    } finally {
      if (loadingEnable) {
        this.loading = false;
      }
    }
  }

  async refetchShop(loadingEnable = true) {
    try {
      if (loadingEnable) {
        this.loading = true;
      }
      const data = await this.apiClient.query("GET_SHOP");
      const updatedShop = data.map((item, index) => {
        item.id = index;
        // item.image =
        //   "https://fastly.picsum.photos/id/870/200/300.jpg?blur=2&grayscale&hmac=ujRymp644uYVjdKJM7kyLDSsrqNSMVRPnGU99cKl6Vs";
        item.isAvailable = item.available;
        item.description = "DEcriprtion";
        item.title = item.name;
        return item;
      });
      this.shopData = updatedShop;
    } catch (err) {
      this.error = err;
    } finally {
      if (loadingEnable) {
        this.loading = false;
      }
    }
  }
}

export default RestaurantManager.getInstance();
