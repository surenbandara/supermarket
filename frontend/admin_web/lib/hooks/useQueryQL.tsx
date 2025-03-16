import { debounce } from 'lodash';
import { useConfiguration } from './useConfiguration';
import { useUserContext } from './useUser';

class RestApiHandler {
  private defaultHeaders: Record<string, string>;
  private retries: number;
  private retryDelayMs: number;
  private debounceMs: number = 500;

  constructor(retries: number = 3, retryDelayMs: number = 1000, debounceMs: number = 500) {
    this.retries = retries;
    this.retryDelayMs = retryDelayMs;
    this.debounceMs = debounceMs;

    // Initialize default headers
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  // Method to set a bearer token in the headers
  setToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  private async debouncedRequest(url: string, method: string, body: any, retries: number, delayMs: number) {
    return new Promise((resolve, reject) => {
      this.debounceHandler(url, method, body, retries, delayMs, resolve, reject);
    });
  }
  
  private debounceHandler = debounce(
    async (url: string, method: string, body: any, retries: number, delayMs: number, resolve: (value: any) => void, reject: (reason?: any) => void) => {
      let attempts = 0;
      while (attempts < retries) {
        try {
          const response = await this.makeRequest(url, method, body);
          resolve(response);
          return;
        } catch (error) {
          if (attempts < retries - 1) {
            await this.delay(delayMs);
          } else {
            reject(error);
          }
        }
        attempts++;
      }
    },
    this.debounceMs
  );

  // Make the request (GET, POST, PUT, DELETE)
  private async makeRequest(url: string, method: string, body?: any) {
    const options: RequestInit = {
      method,
      headers: this.defaultHeaders,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      console.log(`Request failed with status ${response.status}`);
    }

    return await response.json();
  }

  // Handle delay for retries
  private async delay(ms: number) {

    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // GET method
  async get(url: string, token?: string) {
    if (token){this.setToken(token);}
    return await this.debouncedRequest(url, 'GET', null, this.retries, this.retryDelayMs);
  }

  // POST method
  async post(url: string, body: any, token?: string) {
    if (token){this.setToken(token);}
    return await this.debouncedRequest(url, 'POST', body, this.retries, this.retryDelayMs);
  }

  // PUT method
  async put(url: string, body: any, token?: string) {
    if (token){this.setToken(token);}
    return await this.debouncedRequest(url, 'PUT', body, this.retries, this.retryDelayMs);
  }

  // DELETE method
  async delete(url: string, token?: string) {
    if (token){this.setToken(token);}
    return await this.debouncedRequest(url, 'DELETE', null, this.retries, this.retryDelayMs);
  }
}

// Example usage:

export const api = new RestApiHandler(3, 1000, 500);



import {
  ApolloError,
  DocumentNode,
  OperationVariables,
  QueryHookOptions,
  useQuery,
} from '@apollo/client';
import { WatchQueryFetchPolicy } from '@apollo/client/core/watchQueryOptions';
import { useCallback, useState } from 'react';
import { retryQuery } from '../utils/methods';

export const useQueryGQL = <
  T extends DocumentNode,
  V extends OperationVariables | QueryHookOptions,
>(
  query: DocumentNode,
  variables: V,
  options: {
    enabled?: boolean;
    debounceMs?: number;
    pollInterval?: number;
    fetchPolicy?: WatchQueryFetchPolicy;
    retry?: number;
    retryDelayMs?: number;
    onCompleted?: (data: NoInfer<T>) => void;
    onError?: (error: ApolloError) => void;
  } = {}
) => {
  const {
    enabled = true,
    debounceMs = 500,
    pollInterval,
    fetchPolicy,
    retry = 3,
    retryDelayMs = 1000,
    onCompleted,
    onError,
  } = options;

  const { data, error, loading, refetch } = useQuery<T, V>(query, {
    variables,
    skip: !enabled,
    fetchPolicy,
    pollInterval,
    onCompleted,
    onError,
  });

  const [isRefetching, setIsRefetching] = useState(false);

  const debouncedRefetch = useCallback(
    debounce(async (variables?: Partial<V>) => {
      setIsRefetching(true);
      try {
        const result = await retryQuery(
          () => refetch(variables),
          retry,
          retryDelayMs
        );
        return result;
      } finally {
        setIsRefetching(false);
      }
    }, debounceMs),
    [refetch, debounceMs, retry, retryDelayMs]
  );

  const handleRefetch = async () => {
    if (enabled) {
      await debouncedRefetch();
    }
  };

  return {
    data,
    error,
    loading: loading || isRefetching,
    refetch: handleRefetch,
    isError: !!error,
    isSuccess: !!data,
  };
};
