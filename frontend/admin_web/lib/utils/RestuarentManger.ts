// RestaurantManager.ts
import {RestApiClient} from "./RestApiClient";
class RestaurantManager {
  private static instance: RestaurantManager;
  private shopData: any[] = [];
  private productData: any[] = [];
  private systemParameters: any[] = [];
  private orders: any[] = [];
  private loading: boolean = false;
  private error: any = null;
  private networkStatus: boolean = false;
  private apiClient: RestApiClient;
  private token: string | null = null;
  private user: any | null = null;
  private fireBaseConfig: any = {
    webClientId: '805680858281-nqkvefqrc0rfr31855c7he8oj4f9b1j6.apps.googleusercontent.com',
  };

  private constructor() {
    this.apiClient = new RestApiClient(this.token);
  }

  public static getInstance(): RestaurantManager {
    if (!RestaurantManager.instance) {
      RestaurantManager.instance = new RestaurantManager();
    }
    return RestaurantManager.instance;
  }

  setServerUrl(serverUrl: string): void {
    this.apiClient.setServerUrl(serverUrl);
  }

  // Authentication
  async login(user: any): Promise<void> {
    try {
      this.user = user;
      this.token = user?.jwtToken;
      this.apiClient.setToken(this.token ?? '');
    } catch (err) {
      this.error = err;
    }
  }

  logout(): void {
    this.token = null;
    this.user = null;
    this.apiClient.setToken(this.token ?? '');
    this.shopData = [];
    this.productData = [];
    this.systemParameters = [];
  }

  // Getters
  getShopData(): any[] {
    return this.shopData;
  }

  getOrders(): any[] {
    return this.orders;
  }

  getProductData(): any[] {
    return this.productData;
  }

  getSystemParameters(): any[] {
    return this.systemParameters;
  }

  getSystemParameterFromKey(key: string): any | undefined {
    return this.systemParameters.find(param => param.name === key);
  }

  getProductDataFromName(name: string): any | undefined {
    return this.productData.find(product => product.name === name);
  }

  getProductDataFromId(id: number): any | undefined {
    return this.productData.find(product => product.id === id);
  }

  getShopDataFromName(name: string): any | undefined {
    return this.shopData.find(shop => shop.name === name);
  }

  getProductDataForStore(name: string): any[] {
    return this.productData.filter(product => product.shop === name);
  }

  getOrderByStatus(status: string[]): any[] {
    if (status.length === 0) return this.orders;
    return this.orders.filter(order => status.includes(order.status));
  }

  getLoading(): boolean {
    return this.loading;
  }

  getError(): any {
    return this.error;
  }

  getNetworkStatus(): boolean {
    return this.networkStatus;
  }

  // Fetch all data
  async fetchAll(): Promise<void> {
    console.log('FETCHEDDDDD  ', this.user);
    await this.refetchProducts(false);
    await this.sleep(2000);
    await this.refetchShop(false);
    await this.sleep(2000);
    await this.refetchSystemParameters(false);
    await this.sleep(2000);
    await this.refetchOrders(false);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Orders
  async fetchOrders(): Promise<void> {
    console.log("6666666666666666666666666 ", this.user);
    if (this.user) {
      await this.refetchOrders(false);
    }
  }

  async submitOrder(order: any): Promise<{ status: boolean; payload?: any; error?: any }> {
    try {
      this.loading = true;
      const data = await this.apiClient.query("GET_ORDERS", "POST", order);
      return { status: true, payload: data };
    } catch (err) {
      this.error = err;
      return { status: false, error: err };
    } finally {
      this.loading = false;
    }
  }

  async editOrder(order: any): Promise<{ status: boolean; payload?: any; error?: any }> {
    try {
      this.loading = true;
      const data = await this.apiClient.query("GET_ORDERS", "PUT", order);
      await this.refetchOrders(false);
      return { status: true, payload: data };
    } catch (err) {
      this.error = err;
      return { status: false, error: err };
    } finally {
      this.loading = false;
    }
  }

  async cancelOrder(order: any): Promise<{ status: boolean; payload?: any; error?: any }> {
    try {
      this.loading = true;
      const data = await this.apiClient.query("GET_ORDERS", "DELETE", order);
      await this.refetchOrders(false);
      return { status: true, payload: data };
    } catch (err) {
      this.error = err;
      return { status: false, error: err };
    } finally {
      this.loading = false;
    }
  }

  // Refetchers
  private async refetchOrders(loadingEnable: boolean = true): Promise<void> {
    try {
      if (loadingEnable) this.loading = true;
      if (!this.user) return;

      const data = await this.apiClient.query("GET_ORDERS", "GET");
      this.orders = data.map((item: any) => {
        const totalPrice = JSON.parse(item.totalPrice);
        const bills = JSON.parse(item.bill).map((billItem: any) => ({
          ...billItem,
          product: this.getProductDataFromId(billItem.productId),
        }));

        return {
          ...item,
          totalPrice,
          bill: bills,
          shop: this.getShopDataFromName(bills[0]?.product?.shop || '')!,
        };
      });
    } catch (err) {
      this.error = err;
    } finally {
      console.log('ORDDDERS ', this.orders)
      if (loadingEnable) this.loading = false;
    }
  }

  private async refetchSystemParameters(loadingEnable: boolean = true): Promise<void> {
    try {
      if (loadingEnable) this.loading = true;
      const data = await this.apiClient.query("GET_SYSTEM_PARAMETERS");
      this.systemParameters = data;
    } catch (err) {
      this.error = err;
    } finally {
      if (loadingEnable) this.loading = false;
    }
  }

  private async refetchProducts(loadingEnable: boolean = true): Promise<void> {
    try {
      if (loadingEnable) this.loading = true;
      const data = await this.apiClient.query("GET_PRODUCTS");
      this.productData = data.map((item: any) => ({
        ...item,
        title: item.name,
        description: "Description",
        isAvailable: true,
      }));
    } catch (err) {
      this.error = err;
    } finally {
      if (loadingEnable) this.loading = false;
    }
  }

  private async refetchShop(loadingEnable: boolean = true): Promise<void> {
    try {
      if (loadingEnable) this.loading = true;
      const data = await this.apiClient.query("GET_SHOP");
      this.shopData = data.map((item: any, index: number) => ({
        ...item,
        id: index,
        title: item.name,
        description: "Description",
        isAvailable: true,
      }));
    } catch (err) {
      this.error = err;
    } finally {
      if (loadingEnable) this.loading = false;
    }
  }
}

export default RestaurantManager.getInstance();
