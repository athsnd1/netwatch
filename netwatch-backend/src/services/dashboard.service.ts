import prisma from "../lib/prisma.js";

export interface DashboardData {
  totalDevices: number;
  healthyDevices: number;
  downDevices: number;
  unknownDevices: number;
  totalMonitors: number;
  activeMonitors: number;
  recentActivity: {
    deviceId: string;
    deviceName: string;
    status: string;
    timestamp: Date;
  }[];
}

export interface DeviceRealTimeData {
  device: {
    id: string;
    name: string;
    type: string;
    address: string;
    status: string;
  };
  monitors: {
    id: string;
    method: string;
    enabled: boolean;
    latestResult: {
      status: string;
      latency: number | null;
      checkedAt: Date;
    } | null;
  }[];
}

export interface MonitoringSummary {
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

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [devices, monitors, recentResults] = await Promise.all([
    prisma.device.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        status: true,
      },
    }),
    prisma.deviceMonitor.findMany({
      where: {
        device: { userId },
      },
      select: {
        id: true,
        enabled: true,
      },
    }),
    prisma.monitoringResult.findMany({
      where: {
        monitor: {
          device: { userId },
        },
      },
      orderBy: {
        checkedAt: "desc",
      },
      take: 10,
      include: {
        monitor: {
          include: {
            device: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const totalDevices = devices.length;
  const healthyDevices = devices.filter((d) => d.status === "HEALTHY").length;
  const downDevices = devices.filter((d) => d.status === "DOWN").length;
  const unknownDevices = devices.filter((d) => d.status === "UNKNOWN").length;
  const totalMonitors = monitors.length;
  const activeMonitors = monitors.filter((m) => m.enabled).length;

  const recentActivity = recentResults.map((result) => ({
    deviceId: result.monitor.device.id,
    deviceName: result.monitor.device.name,
    status: result.status,
    timestamp: result.checkedAt,
  }));

  return {
    totalDevices,
    healthyDevices,
    downDevices,
    unknownDevices,
    totalMonitors,
    activeMonitors,
    recentActivity,
  };
}

export async function getDeviceRealTimeData(
  userId: string,
  deviceId: string
): Promise<DeviceRealTimeData | null> {
  const device = await prisma.device.findFirst({
    where: {
      id: deviceId,
      userId,
    },
    include: {
      monitors: {
        include: {
          results: {
            orderBy: {
              checkedAt: "desc",
            },
            take: 1,
          },
        },
      },
    },
  });

  if (!device) {
    return null;
  }

  return {
    device: {
      id: device.id,
      name: device.name,
      type: device.type,
      address: device.address,
      status: device.status,
    },
    monitors: device.monitors.map((monitor) => ({
      id: monitor.id,
      method: monitor.method,
      enabled: monitor.enabled,
      latestResult: monitor.results[0]
        ? {
            status: monitor.results[0].status,
            latency: monitor.results[0].latency,
            checkedAt: monitor.results[0].checkedAt,
          }
        : null,
    })),
  };
}

export async function getMonitoringSummary(userId: string): Promise<MonitoringSummary> {
  const [devices, monitors] = await Promise.all([
    prisma.device.findMany({
      where: { userId },
      select: {
        type: true,
        status: true,
      },
    }),
    prisma.deviceMonitor.findMany({
      where: {
        device: { userId },
      },
      select: {
        method: true,
      },
    }),
  ]);

  const byStatus = {
    HEALTHY: devices.filter((d) => d.status === "HEALTHY").length,
    DOWN: devices.filter((d) => d.status === "DOWN").length,
    UNKNOWN: devices.filter((d) => d.status === "UNKNOWN").length,
  };

  const byType = {
    ROUTER: devices.filter((d) => d.type === "ROUTER").length,
    SERVER: devices.filter((d) => d.type === "SERVER").length,
    WEB_SERVER: devices.filter((d) => d.type === "WEB_SERVER").length,
    PRINTER: devices.filter((d) => d.type === "PRINTER").length,
    PC: devices.filter((d) => d.type === "PC").length,
    PHONE: devices.filter((d) => d.type === "PHONE").length,
  };

  const byMethod = {
    ICMP: monitors.filter((m) => m.method === "ICMP").length,
    TCP: monitors.filter((m) => m.method === "TCP").length,
    HTTP: monitors.filter((m) => m.method === "HTTP").length,
    HTTPS: monitors.filter((m) => m.method === "HTTPS").length,
    SNMP: monitors.filter((m) => m.method === "SNMP").length,
  };

  return {
    byStatus,
    byType,
    byMethod,
  };
}