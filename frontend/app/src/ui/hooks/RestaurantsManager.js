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

  getProductData() {
    return this.productData;
  }

  getSystemParameters() {
    return this.systemParameters;
  }

  getSystemParameterFromKey(key) {
    const filteredParameters = this.systemParameters.filter((parameters) => parameters.name == key);
    return  filteredParameters[0];
  }

  getProductDataFromName(name) {
    const filteredProducts = this.productData.filter((product) => product.name == name);
    return filteredProducts;
  }

  getShopDataFromName(name) {
    const filteredShops = this.shopData.filter((shop) => shop.name == name);
    return filteredShops;
  }

  getProductDataForStore(name) {
    const filteredProducts = this.productData.filter((product) => product.shop == name);
    return filteredProducts;
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

  async fetchAll() {
    await this.refetchProducts();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.refetchShop();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.refetchSystemParamteres();
    console.log("Fetched all data");
    console.log("Shop data:", this.shopData);
    console.log("Product data:", this.productData);
    console.log("System parameters:", this.systemParameters);
  }

  async refetchSystemParamteres() {
    try {
      console.log('eeeeeeeeeeeeeeeeeeeeeee');
      this.loading = true;
      const data = await this.apiClient.query("GET_SYSTEM_PARAMETERS")
      console.log("System parameterscccccccc:", data);
      this.systemParameters = data;
    } catch (err) {
      console.log("Error fetching system parameters:", err);
      this.error = err;
    } finally {
      this.loading = false;
    }
  }

  async refetchProducts() {
    try {
      this.loading = true;
      const data = await this.apiClient.query("GET_PRODUCTS");
      const updatedProducts = data.map((item, index) => {
        item.id = index;
        item.image =
          "https://fastly.picsum.photos/id/870/200/300.jpg?blur=2&grayscale&hmac=ujRymp644uYVjdKJM7kyLDSsrqNSMVRPnGU99cKl6Vs";
        item.isAvailable = true;
        item.description = "DEcriprtion";
        item.title = item.name;
        return item;
      });
      console.log("Updated products:", updatedProducts);
      this.productData = updatedProducts;
    } catch (err) {
      this.error = err;
    } finally {
      this.loading = false;
    }
  }

  async refetchShop() {
    try {
      this.loading = true;
      const data = await this.apiClient.query("GET_SHOP");
      const updatedShop = data.map((item, index) => {
        item.id = index;
        item.image =
          "https://fastly.picsum.photos/id/870/200/300.jpg?blur=2&grayscale&hmac=ujRymp644uYVjdKJM7kyLDSsrqNSMVRPnGU99cKl6Vs";
        item.isAvailable = true;
        item.description = "DEcriprtion";
        item.title = item.name;
        return item;
      });
      this.shopData = updatedShop;
    } catch (err) {
      this.error = err;
    } finally {
      this.loading = false;
    }
  }
}

export default RestaurantManager.getInstance();
