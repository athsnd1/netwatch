import { createAuthenticatedClient } from './client';
import type { Device, CreateDeviceRequest, UpdateDeviceRequest, DeviceMonitor, CreateMonitorRequest, UpdateMonitorRequest, MonitoringResult } from '../types';

export const devicesApi = {
  // Get all devices for authenticated user
  getAll: async (token: string): Promise<Device[]> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get<Device[]>('/devices');
    return response.data;
  },

  // Get specific device by ID
  getById: async (id: string, token: string): Promise<Device> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get<Device>(`/devices/${id}`);
    return response.data;
  },

  // Get device-specific metrics
  getMetrics: async (id: string, token: string): Promise<any> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get<any>(`/devices/${id}/metrics`);
    return response.data;
  },

  // Create a new device with monitors
  create: async (data: CreateDeviceRequest, token: string): Promise<Device> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post<Device>('/devices', data);
    return response.data;
  },

  // Update device information
  update: async (id: string, data: UpdateDeviceRequest, token: string): Promise<{ message: string }> => {
    const client = createAuthenticatedClient(token);
    const response = await client.patch<{ message: string }>(`/devices/${id}`, data);
    return response.data;
  },

  // Delete a device and all associated monitors
  delete: async (id: string, token: string): Promise<{ message: string }> => {
    const client = createAuthenticatedClient(token);
    const response = await client.delete<{ message: string }>(`/devices/${id}`);
    return response.data;
  },

  // Monitor management (nested routes)
  monitors: {
    // Add a monitor to a device
    add: async (deviceId: string, data: CreateMonitorRequest, token: string): Promise<DeviceMonitor> => {
      const client = createAuthenticatedClient(token);
      // Use the nested endpoint with the new createNestedMonitorSchema
      const requestData: Record<string, unknown> = {
        method: data.method
      };
      // Only include config if it's not undefined
      if (data.config !== undefined) {
        requestData.config = data.config;
      }
      const response = await client.post<DeviceMonitor>(`/devices/${deviceId}/monitors`, requestData);
      return response.data;
    },

    // Get all monitors for a specific device
    getAll: async (deviceId: string, token: string): Promise<DeviceMonitor[]> => {
      const client = createAuthenticatedClient(token);
      const response = await client.get<DeviceMonitor[]>(`/devices/${deviceId}/monitors`);
      return response.data;
    },

    // Get monitoring results for a specific monitor
    getResults: async (deviceId: string, monitorId: string, token: string): Promise<MonitoringResult[]> => {
      const client = createAuthenticatedClient(token);
      const response = await client.get<MonitoringResult[]>(`/devices/${deviceId}/monitors/${monitorId}/results`);
      return response.data;
    },

    // Update monitor configuration
    update: async (deviceId: string, monitorId: string, data: UpdateMonitorRequest, token: string): Promise<DeviceMonitor> => {
      const client = createAuthenticatedClient(token);
      // Use the nested endpoint as documented
      const requestData: Record<string, unknown> = {};
      // Only include config if it's not undefined
      if (data.config !== undefined) {
        requestData.config = data.config;
      }
      // Only include enabled if it's not undefined
      if (data.enabled !== undefined) {
        requestData.enabled = data.enabled;
      }
      const response = await client.patch<DeviceMonitor>(`/devices/${deviceId}/monitors/${monitorId}`, requestData);
      return response.data;
    },

    // Delete a monitor from a device
    delete: async (deviceId: string, monitorId: string, token: string): Promise<{ message: string }> => {
      const client = createAuthenticatedClient(token);
      // Use the nested endpoint as documented
      const response = await client.delete<{ message: string }>(`/devices/${deviceId}/monitors/${monitorId}`);
      return response.data;
    },
  },
};
