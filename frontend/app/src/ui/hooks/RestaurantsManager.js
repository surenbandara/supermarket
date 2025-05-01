// RestaurantManager.ts
import NetInfo from "@react-native-community/netinfo";
import { useRestApi } from ".";
import { restaurant } from "../../apollo/queries";
import { RestApiClient } from './RestApiClient';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import auth from '@react-native-firebase/auth';

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
    webClientId: '805680858281-nqkvefqrc0rfr31855c7he8oj4f9b1j6.apps.googleusercontent.com',
  }
  token = null;
  user = null;

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
      this.user = data.basicUserDetails
      this.token = data.jwtToken;
      console.log("Login successful:", this.user);
      console.log("Token received:", this.token);
      this.apiClient.setToken(this.token);
    } catch (err) {
      this.error = err;
    } 
  
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

  async fetchOrders() {
    if (this.user !== null) {
      this.refetchOrders(false);
    }
  }

  async fetchAll() {
    await this.refetchProducts(false);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.refetchShop(false);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.refetchSystemParamteres(false);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.refetchOrders(false);
    console.log("Fetched all data");
    // console.log("Shop data:", this.shopData);
    // console.log("Product data:", this.productData);
    console.log("System parameters:", this.systemParameters);
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
      console.log('Error editing order:', err);
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

      this.orders = updatedOrders;
    } catch (err) {
      console.log("Error fetching orders:", err);
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
        item.description = "DEcriprtion";
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
        item.isAvailable = true;
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
