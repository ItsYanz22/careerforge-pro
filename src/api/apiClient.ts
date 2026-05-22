import { API_BASE_URL } from '@config';

export interface RequestOptions extends RequestInit {
  data?: any;
  responseType?: 'json' | 'blob' | 'text';
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { data, headers: customHeaders, responseType = 'json', ...customConfig } = options;

  const token = localStorage.getItem('token');
  
  const isFormData = data instanceof FormData;
  
  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
    headers,
    ...customConfig,
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, config);

  if (!response.ok) {
    const responseData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      responseData.error || responseData.message || 'An error occurred',
      responseData
    );
  }

  if (responseType === 'blob') {
    return (await response.blob()) as any;
  }
  if (responseType === 'text') {
    return (await response.text()) as any;
  }

  const responseData = await response.json().catch(() => ({}));
  return responseData.data !== undefined ? responseData.data : responseData;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, data?: any, options?: Omit<RequestOptions, 'method' | 'data'>) =>
    request<T>(endpoint, { ...options, method: 'POST', data }),
    
  put: <T>(endpoint: string, data?: any, options?: Omit<RequestOptions, 'method' | 'data'>) =>
    request<T>(endpoint, { ...options, method: 'PUT', data }),
    
  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
