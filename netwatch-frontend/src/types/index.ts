// API Types based on NetWatch Backend API Documentation

export type DeviceType = "ROUTER" | "SERVER" | "WEB_SERVER" | "PRINTER" | "PC" | "PHONE";
export type DeviceStatus = "UNKNOWN" | "HEALTHY" | "DOWN";
export type MonitorMethod = "ICMP" | "TCP" | "HTTP" | "HTTPS" | "SNMP";

export interface Device {
  id: string;
  userId: string;
  name: string;
  type: DeviceType;
  address: string;
  status: DeviceStatus;
  createdAt: string;
  updatedAt: string;
  monitors: DeviceMonitor[];
}

export interface DeviceMonitor {
  id: string;
  deviceId: string;
  method: MonitorMethod;
  enabled: boolean;
  config: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  latestResult?: MonitoringResult;
}

export interface MonitoringResult {
  id: string;
  monitorId: string;
  status: DeviceStatus;
  latency: number | null;
  checkedAt: string;
}

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardOverview {
  totalDevices: number;
  healthyDevices: number;
  downDevices: number;
  unknownDevices: number;
  totalMonitors: number;
  activeMonitors: number;
  recentActivity: Array<{
    deviceId: string;
    deviceName: string;
    status: string;
    timestamp: string;
  }>;
}

export interface DashboardSummary {
  byStatus: {
    HEALTHY: number;
    DOWN: number;
    UNKNOWN: number;
  };
  byType: {
    ROUTER: number;
    SERVER: number;
    WEB_SERVER: number;
    PRINTER: number;
    PC: number;
    PHONE: number;
  };
  byMethod: {
    ICMP: number;
    TCP: number;
    HTTP: number;
    HTTPS: number;
    SNMP: number;
  };
}

export interface DeviceRealtimeData {
  device: {
    id: string;
    name: string;
    type: string;
    address: string;
    status: string;
  };
  monitors: Array<{
    id: string;
    method: string;
    enabled: boolean;
    latestResult: {
      status: string;
      latency: number | null;
      checkedAt: string;
    } | null;
  }>;
}

export interface WebServerCheckResult {
  url: string;
  status: DeviceStatus;
  latency: number | null;
  statusCode: number | null;
  responseSize: number | null;
  timestamp: string;
}

export interface WebServerMetrics {
  uptime: number | null;
  responseTime: number | null;
  statusCode: number | null;
  responseSize: number | null;
  successRate: number;
  totalRequests: number;
  failedRequests: number;
  lastCheckTime: string;
}

export interface ServerInterface {
  index: number;
  name: string;
  type: string;
  mtu: number;
  speed: number;
  speedMbps: number;
  adminStatus: "UP" | "DOWN" | "TESTING" | "UNKNOWN";
  operStatus: "UP" | "DOWN" | "TESTING" | "UNKNOWN";
  bytesIn: number;
  bytesOut: number;
  inputErrors: number;
  outputErrors: number;
}

export interface ServerResources {
  cpuUsage: number | null;
  memoryTotal: number | null;
  memoryUsed: number | null;
  memoryUsage: number | null;
}

export interface DiskStorage {
  index: number;
  description: string;
  type: string;
  allocationUnits: number;
  size: number;
  used: number;
  sizeGB: number;
  usedGB: number;
  usagePercent: number;
}

export interface ServerMetrics {
  description: string;
  objectId: string;
  uptime: number | null;
  name: string;
  location: string;
  interfaces: ServerInterface[];
  resources: ServerResources;
  disks: DiskStorage[];
}

export interface WebServerMonitorResult {
  url: string;
  duration: number;
  interval: number;
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageLatency: number | null;
  uptime: number;
  checks: Array<{
    url: string;
    status: DeviceStatus;
    latency: number | null;
    statusCode: number | null;
    responseSize: number | null;
    timestamp: string;
  }>;
  startTime: string;
  endTime: string;
}

export interface CreateDeviceRequest {
  name: string;
  type: DeviceType;
  address: string;
  monitors: Array<{
    method: MonitorMethod;
    config?: Record<string, unknown>;
  }>;
}

export interface UpdateDeviceRequest {
  name?: string;
  type?: DeviceType;
  address?: string;
}

export interface CreateMonitorRequest {
  method: MonitorMethod;
  config?: Record<string, unknown>;
}

export interface UpdateMonitorRequest {
  config?: Record<string, unknown>;
  enabled?: boolean;
}

export interface WebServerCheckRequest {
  url: string;
}

export interface WebServerMonitorRequest {
  url: string;
  duration?: number;
  interval?: number;
}
