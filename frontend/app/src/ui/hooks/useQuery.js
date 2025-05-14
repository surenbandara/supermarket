import { debounce } from 'lodash';
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from '../../context/User';
import useEnvVars from '../../../environment';

// Define API endpoint mappings
export const API_ENDPOINTS = {
  GET_USERS: '/users',
  GET_ORDERS: '/orders',
  GET_SHOP: '/shop',
  GET_CUSINE: '/cusine',
  GET_SYSTEM_PARAMETERS: '/system-parameters',
  GET_PRODUCTS: '/products'
};

export default function useRestApi(retries = 3, retryDelayMs = 1000, debounceMs = 500) {
  const { SERVER_URL } = useEnvVars();
  const { profile } = useUserContext();
  const navigation = useNavigation();

  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDM4MjkzMDcsImV4cCI6MTc0MzkxNTcwN30.yT4350fdPs0T0coadF59sDbqzWc4CCeHuCGfbd1ywg0';

  const defaultHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Delay function for retries
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Debounced request function
  const debouncedRequest = debounce(async (url, method, body, retries, delayMs, resolve, reject) => {
    let attempts = 0;
    while (attempts < retries) {
      try {
        const response = await makeRequest(url, method, body);
        resolve(response);
        return;
      } catch (error) {
        if (attempts < retries - 1) {
          await delay(delayMs);
        } else {
          reject(error);
        }
      }
      attempts++;
    }
  }, debounceMs);

  // Generic API request function
  async function makeRequest(url, method, body) {
    const options = {
      method,
      headers: defaultHeaders,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${SERVER_URL}${url}`, options);

    if (!response.ok) {
      console.log(`Request failed with status ${response.status}`);

      if (response.status === 401) {
        navigation.navigate('Login'); 
      }

      throw new Error(`HTTP Error: ${response.status}`);
    }

    return await response.json();
  }

  async function useQuery(apiConstant, method = 'GET', body = null) {
    const endpoint = API_ENDPOINTS[apiConstant];
    if (!endpoint) {
      throw new Error(`API constant "${apiConstant}" not found.`);
    }

    return new Promise((resolve, reject) => {
      debouncedRequest(endpoint, method, body, retries, retryDelayMs, resolve, reject);
    });
  }

  return { useQuery };
}
