export const API_ENDPOINTS = {
    GET_USERS: '/users',
    GET_ORDERS: '/orders',
    GET_SHOP: '/shop',
    GET_CUSINE: '/cusine',
    GET_SYSTEM_PARAMETERS: '/system-parameters',
    GET_PRODUCTS: '/products',
    GET_SYSTEM_PARAMETERS: '/system-parameters',
    LOGIN: '/login'
  };
  
  export class RestApiClient {
    constructor(token) {
      //this.SERVER_URL = 'http://10.0.2.2:3000';
      this.SERVER_URL = 'https://afmdelivery.lk/api';
      this.token = token;
      this.defaultHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };
    }

    setToken(token) {
      this.token = token;
      this.defaultHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };
    }
  
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  
    async makeRequest(url, method, body) {
      let finalUrl = `${this.SERVER_URL}${url}`;
      const options = {
        method,
        headers: this.defaultHeaders,
      };
    
      if (method == 'GET' && body) {
        const queryParams = new URLSearchParams(body).toString();
        finalUrl += `?${queryParams}`;
      } else if (body) {
        options.body = JSON.stringify(body);
      }
    
      const response = await fetch(finalUrl, options);
      if (!response.ok) {
        console.log(`Request failed with status ${response.status}`);
        throw new Error(`HTTP Error: ${response.status}`);
      }
    
      return await response.json();
    }    
  
    async query(apiConstant, method = 'GET', body = null, retries = 3, retryDelayMs = 1000) {
      const endpoint = API_ENDPOINTS[apiConstant];
      if (!endpoint) throw new Error(`Unknown endpoint: ${apiConstant}`);
      if (this.token == null && apiConstant != 'LOGIN') throw new Error(`Token is null`);
      
      let attempts = 0;
      while (attempts < retries) {
        try {
          return await this.makeRequest(endpoint, method, body);
        } catch (err) {
          if (attempts < retries - 1) {
            await this.delay(retryDelayMs);
          } else {
            throw err;
          }
        }
        attempts++;
      }
    }
  }
  