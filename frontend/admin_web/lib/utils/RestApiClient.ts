export const API_ENDPOINTS: { [key: string]: string } = {
  GET_USERS: '/users',
  GET_ORDERS: '/orders',
  GET_SHOP: '/shop',
  GET_CUSINE: '/cusine',
  GET_SYSTEM_PARAMETERS: '/system-parameters',
  GET_PRODUCTS: '/products',
  LOGIN: '/login'
};

interface RequestOptions {
  method: string;
  headers: { [key: string]: string };
  body?: string;
}

export class RestApiClient {
  private SERVER_URL: string;
  private token: string | null;
  private defaultHeaders: { [key: string]: string };

  constructor(token: string | null) {
    this.SERVER_URL = '';
    this.token = token;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

  setServerUrl(serverUrl: string): void {
    this.SERVER_URL = serverUrl;
  }

  setToken(token: string): void {
    console.log('Setting token:', token);
    this.token = token;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async makeRequest(url: string, method: string, body?: Record<string, any>): Promise<any> {
    console.log('Making request with headers:', this.defaultHeaders);
    let finalUrl = `${this.SERVER_URL}${url}`;
    const options: RequestOptions = {
      method,
      headers: this.defaultHeaders,
    };

    if (method === 'GET' && body) {
      const queryParams = new URLSearchParams(body as Record<string, string>).toString();
      finalUrl += `?${queryParams}`;
      console.log('Final URL:', finalUrl);
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

  async query(
    apiConstant: keyof typeof API_ENDPOINTS,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body: Record<string, any> | null = null,
    retries: number = 3,
    retryDelayMs: number = 1000
  ): Promise<any> {
    const endpoint = API_ENDPOINTS[apiConstant];
    if (!endpoint) throw new Error(`Unknown endpoint: ${apiConstant}`);
    if (this.token == null && apiConstant !== 'LOGIN') throw new Error('Token is null');

    let attempts = 0;
    while (attempts < retries) {
      try {
        return await this.makeRequest(endpoint, method, body ?? undefined);
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
