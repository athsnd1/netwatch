import { createAuthenticatedClient } from './client';
import type { WebServerCheckResult, WebServerMetrics, WebServerMonitorResult, WebServerCheckRequest, WebServerMonitorRequest } from '../types';

export const webserverApi = {
  // Perform a single web server health check
  check: async (data: WebServerCheckRequest, token: string): Promise<WebServerCheckResult> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post<WebServerCheckResult>('/webserver/check', data);
    return response.data;
  },

  // Get web server metrics over time
  getMetrics: async (url: string, token: string): Promise<WebServerMetrics> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get<WebServerMetrics>(`/webserver/metrics?url=${encodeURIComponent(url)}`);
    return response.data;
  },

  // Monitor a web server over a specified duration
  monitor: async (data: WebServerMonitorRequest, token: string): Promise<WebServerMonitorResult> => {
    const client = createAuthenticatedClient(token);
    const response = await client.post<WebServerMonitorResult>('/webserver/monitor', data);
    return response.data;
  },
};
