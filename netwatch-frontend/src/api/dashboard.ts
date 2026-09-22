import { createAuthenticatedClient } from './client';
import type { DashboardOverview, DashboardSummary, DeviceRealtimeData } from '../types';

export const dashboardApi = {
  // Get dashboard overview data
  getOverview: async (token: string): Promise<DashboardOverview> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get<DashboardOverview>('/dashboard/overview');
    return response.data;
  },

  // Get monitoring summary statistics
  getSummary: async (token: string): Promise<DashboardSummary> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get<DashboardSummary>('/dashboard/summary');
    return response.data;
  },

  // Get real-time data for a specific device
  getDeviceRealtime: async (deviceId: string, token: string): Promise<DeviceRealtimeData> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get<DeviceRealtimeData>(`/dashboard/devices/${deviceId}/realtime`);
    return response.data;
  },
};
