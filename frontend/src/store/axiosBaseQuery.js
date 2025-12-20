import axios from 'axios';
import { sanitizeRequestData, sanitizeResponseData } from '../utils/sanitization';

/**
 * Creates an axios-based base query for RTK Query
 * @param {Object} options - Configuration options
 * @param {string} options.baseUrl - Base URL for API requests
 * @returns {Function} RTK Query base query function
 */
const axiosBaseQuery = ({ baseUrl = '' } = {}) => {
  // Create axios instance
  const axiosInstance = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token, idempotency key, and sanitize data
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add idempotency key for POST/PUT/PATCH requests if not already present
      if (['POST', 'PUT', 'PATCH'].includes(config.method?.toUpperCase())) {
        if (!config.headers['Idempotency-Key'] && !config.headers['idempotency-key']) {
          // Generate idempotency key from request data (synchronous)
          const dataString = JSON.stringify(config.data || {});
          const urlString = config.url || '';
          const methodString = config.method || '';
          const combined = dataString + urlString + methodString + Date.now();

          // Simple hash function (synchronous)
          let hash = 0;
          for (let i = 0; i < combined.length; i++) {
            const char = combined.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
          }

          // Convert to hex string and use first 32 characters
          const hashHex = Math.abs(hash).toString(16).padStart(8, '0');
          const idempotencyKey = `${hashHex}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
          config.headers['Idempotency-Key'] = idempotencyKey.substring(0, 64);
        }
      }

      // Ensure relative URLs combine with baseURL
      if (config.url && config.url.startsWith('/')) {
        config.url = config.url.substring(1);
      }

      // Sanitize request data for security
      if (config.data) {
        config.data = sanitizeRequestData(config.data);
      }

      if (config.params) {
        config.params = sanitizeRequestData(config.params);
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle errors and sanitize responses
  axiosInstance.interceptors.response.use(
    (response) => {
      // Skip sanitization for blob responses (files, PDFs, images, etc.)
      if (response.data && !(response.data instanceof Blob) && !(response.data instanceof ArrayBuffer)) {
        response.data = sanitizeResponseData(response.data);
      }
      return response;
    },
    (error) => {
      // Handle authentication errors
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Handle network errors
      if (!error.response) {
        return Promise.reject({
          ...error,
          message: `Unable to connect to server at ${error.config?.baseURL || baseUrl}. Please ensure the backend server is running.`,
          type: 'network',
        });
      }

      return Promise.reject(error);
    }
  );

  // Return RTK Query base query function
  return async ({ url, method = 'GET', data, params, headers, ...rest }) => {
    try {
      const result = await axiosInstance({
        url,
        method,
        data,
        params,
        headers,
        ...rest,
      });

      return {
        data: result.data,
      };
    } catch (axiosError) {
      const err = axiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
};

export default axiosBaseQuery;
