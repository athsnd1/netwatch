import { useAuth } from '@clerk/react';
import { useCallback } from 'react';
import apiClient from '@/api/client';

export const useAuthenticatedApi = () => {
  const { getToken } = useAuth();

  const authenticatedRequest = useCallback(async (request: () => Promise<any>) => {
    try {
      const token = await getToken();
      const originalRequest = request;
      
      // Store original headers
      const originalHeaders = apiClient.defaults.headers.common;
      
      // Add auth header
      if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await originalRequest();
      
      // Restore original headers
      apiClient.defaults.headers.common = originalHeaders;
      
      return response;
    } catch (error) {
      console.error('Authenticated request failed:', error);
      throw error;
    }
  }, [getToken]);

  return { authenticatedRequest };
};