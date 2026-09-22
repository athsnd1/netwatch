import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { useAuth } from '@clerk/react';
import { devicesApi, dashboardApi } from '@/api';
import type { Device, DashboardOverview, DeviceRealtimeData, MonitoringResult, CreateDeviceRequest, UpdateDeviceRequest, UpdateMonitorRequest, CreateMonitorRequest } from '@/types';

// Custom hook to get auth token
const useAuthToken = () => {
  const { getToken } = useAuth();
  return getToken;
};

// Devices hooks
export const useDevices = (options?: Omit<UseQueryOptions<Device[]>, 'queryKey' | 'queryFn'>) => {
  const getToken = useAuthToken();
  
  return useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No auth token available');
      return devicesApi.getAll(token);
    },
    refetchInterval: 15000, // Poll every 15 seconds for device status changes
    ...options,
  });
};

// Logs hook - fetches monitoring results for all devices
export const useLogs = (options?: Omit<UseQueryOptions<Array<{
  deviceName: string;
  deviceType: string;
  monitorMethod: string;
  result: MonitoringResult;
}>>, 'queryKey' | 'queryFn'>) => {
  const getToken = useAuthToken();
  
  return useQuery({
    queryKey: ['logs'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No auth token available');
      
      const devicesData = await devicesApi.getAll(token);

      // Fetch monitoring results for all monitors
      const results: Array<{
        deviceName: string;
        deviceType: string;
        monitorMethod: string;
        result: MonitoringResult;
      }> = [];

      for (const device of devicesData) {
        for (const monitor of device.monitors) {
          try {
            const monitorResults = await devicesApi.monitors.getResults(device.id, monitor.id, token);
            // Get the most recent result for each monitor
            if (monitorResults.length > 0) {
              results.push({
                deviceName: device.name,
                deviceType: device.type,
                monitorMethod: monitor.method,
                result: monitorResults[0] // Most recent first
              });
            }
          } catch (error) {
            console.error(`Failed to fetch results for monitor ${monitor.id}:`, error);
          }
        }
      }

      // Sort by timestamp (most recent first)
      results.sort((a, b) => 
        new Date(b.result.checkedAt).getTime() - new Date(a.result.checkedAt).getTime()
      );

      return results;
    },
    refetchInterval: 30000, // Poll every 30 seconds for logs
    ...options,
  });
};

export const useDevice = (id: string, options?: Omit<UseQueryOptions<Device>, 'queryKey' | 'queryFn'>) => {
  const getToken = useAuthToken();
  
  return useQuery({
    queryKey: ['device', id],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No auth token available');
      return devicesApi.getById(id, token);
    },
    enabled: !!id,
    refetchInterval: 15000, // Poll every 15 seconds for device updates
    staleTime: 0, // Always consider data stale to force immediate refetch on invalidation
    ...options,
  });
};

export const useDeviceMetrics = (id: string, options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) => {
  const getToken = useAuthToken();
  
  return useQuery({
    queryKey: ['deviceMetrics', id],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No auth token available');
      return await devicesApi.getMetrics(id, token);
    },
    enabled: !!id,
    ...options,
  });
};

export const useDeviceRealtime = (id: string, options?: Omit<UseQueryOptions<DeviceRealtimeData>, 'queryKey' | 'queryFn'>) => {
  const getToken = useAuthToken();
  
  return useQuery({
    queryKey: ['deviceRealtime', id],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No auth token available');
      return dashboardApi.getDeviceRealtime(id, token);
    },
    enabled: !!id,
    refetchInterval: 15000, // Poll every 15 seconds for device details
    ...options,
  });
};

export const useMonitorResults = (deviceId: string, monitorId: string, options?: Omit<UseQueryOptions<MonitoringResult[]>, 'queryKey' | 'queryFn'>) => {
  const getToken = useAuthToken();
  
  return useQuery({
    queryKey: ['monitorResults', deviceId, monitorId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No auth token available');
      return devicesApi.monitors.getResults(deviceId, monitorId, token);
    },
    enabled: !!deviceId && !!monitorId,
    ...options,
  });
};

// Hook to fetch all monitor results for a device at once
export const useAllMonitorResults = (deviceId: string, monitorIds: string[], options?: Omit<UseQueryOptions<Record<string, MonitoringResult[]>>, 'queryKey' | 'queryFn'>) => {
  const getToken = useAuthToken();
  
  return useQuery({
    queryKey: ['allMonitorResults', deviceId, ...monitorIds],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No auth token available');
      
      const results: Record<string, MonitoringResult[]> = {};
      
      await Promise.all(monitorIds.map(async (monitorId) => {
        try {
          const monitorResults = await devicesApi.monitors.getResults(deviceId, monitorId, token);
          results[monitorId] = monitorResults;
        } catch (error) {
          console.error(`Failed to fetch results for monitor ${monitorId}:`, error);
          results[monitorId] = [];
        }
      }));
      
      return results;
    },
    enabled: !!deviceId && monitorIds.length > 0,
    ...options,
  });
};

// Dashboard hooks
export const useDashboardOverview = (options?: Omit<UseQueryOptions<DashboardOverview>, 'queryKey' | 'queryFn'>) => {
  const getToken = useAuthToken();
  
  return useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No auth token available');
      return dashboardApi.getOverview(token);
    },
    refetchInterval: 15000, // Poll every 15 seconds for dashboard updates
    ...options,
  });
};

// Mutation hooks
export const useCreateDevice = () => {
  const queryClient = useQueryClient();
  const getToken = useAuthToken();
  
  return useMutation({
    mutationFn: async (data: CreateDeviceRequest) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token available');
      return devicesApi.create(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
    },
  });
};

export const useUpdateDevice = () => {
  const queryClient = useQueryClient();
  const getToken = useAuthToken();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDeviceRequest }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token available');
      return devicesApi.update(id, data, token);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device', id] });
      queryClient.invalidateQueries({ queryKey: ['deviceRealtime', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
    },
  });
};

export const useDeleteDevice = () => {
  const queryClient = useQueryClient();
  const getToken = useAuthToken();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token available');
      return devicesApi.delete(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
    },
  });
};

export const useUpdateMonitor = () => {
  const queryClient = useQueryClient();
  const getToken = useAuthToken();
  
  return useMutation({
    mutationFn: async ({ deviceId, monitorId, data }: { deviceId: string; monitorId: string; data: UpdateMonitorRequest }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token available');
      return devicesApi.monitors.update(deviceId, monitorId, data, token);
    },
    onSuccess: (_, { deviceId }) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device', deviceId] });
      queryClient.invalidateQueries({ queryKey: ['deviceRealtime', deviceId] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
    },
  });
};

export const useAddMonitor = () => {
  const queryClient = useQueryClient();
  const getToken = useAuthToken();
  
  return useMutation({
    mutationFn: async ({ deviceId, data }: { deviceId: string; data: CreateMonitorRequest }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token available');
      if (!deviceId) throw new Error('Device ID is required');
      
      console.log('API call: devicesApi.monitors.add with deviceId:', deviceId, 'data:', data);
      return devicesApi.monitors.add(deviceId, data, token);
    },
    onSuccess: (_, { deviceId }) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device', deviceId] });
      queryClient.invalidateQueries({ queryKey: ['deviceRealtime', deviceId] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
    },
  });
};

export const useDeleteMonitor = () => {
  const queryClient = useQueryClient();
  const getToken = useAuthToken();
  
  return useMutation({
    mutationFn: async ({ deviceId, monitorId }: { deviceId: string; monitorId: string }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token available');
      return devicesApi.monitors.delete(deviceId, monitorId, token);
    },
    onSuccess: (_, { deviceId }) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device', deviceId] });
      queryClient.invalidateQueries({ queryKey: ['deviceRealtime', deviceId] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
    },
  });
};
