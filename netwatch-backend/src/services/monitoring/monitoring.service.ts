import prisma from "../../lib/prisma.js";
import { checkICMP } from "./icmp.service.js";
import { checkTCP } from "./tcp.service.js";
import { checkHTTP } from "./http.service.js";
import { checkSNMP } from "./snmp.service.js";
import { getPrinterMetrics, type PrinterMetrics } from "./printers/printer.service.js";
import { getRouterMetrics, type RouterMetrics } from "./routers/router.service.js";
import { getServerMetrics, type ServerMetrics } from "./servers/server.service.js";

export async function aggregateDeviceStatus(deviceId: string): Promise<void> {
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    include: {
      monitors: {
        where: { enabled: true },
        include: {
          results: {
            orderBy: { checkedAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!device) {
    return;
  }

  const enabledMonitors = device.monitors;

  if (enabledMonitors.length === 0) {
    // No enabled monitors, set to UNKNOWN
    await prisma.device.update({
      where: { id: deviceId },
      data: { status: "UNKNOWN" },
    });
    return;
  }

  const latestResults = enabledMonitors
    .map(m => m.results[0])
    .filter(r => r !== undefined);

  if (latestResults.length === 0) {
    // Monitors exist but no results yet
    await prisma.device.update({
      where: { id: deviceId },
      data: { status: "UNKNOWN" },
    });
    return;
  }

  const hasHealthy = latestResults.some(r => r.status === "HEALTHY");
  const hasDown = latestResults.some(r => r.status === "DOWN");

  let newStatus: "HEALTHY" | "DOWN" | "UNKNOWN";

  if (hasHealthy) {
    newStatus = "HEALTHY";
  } else if (hasDown) {
    newStatus = "DOWN";
  } else {
    newStatus = "UNKNOWN";
  }

  await prisma.device.update({
    where: { id: deviceId },
    data: { status: newStatus },
  });
}

export async function runMonitor(monitorId: string) {
  const monitor = await prisma.deviceMonitor.findUnique({
    where: {
      id: monitorId,
    },
    include: {
      device: true,
    },
  });

  if (!monitor || !monitor.enabled) {
    return null;
  }

  if (monitor.method === "ICMP") {
    const result = await checkICMP(monitor.device.address);

    await prisma.monitoringResult.create({
      data: {
        monitorId: monitor.id,
        status: result.status,
        latency: result.latency,
      },
    });

    await aggregateDeviceStatus(monitor.deviceId);

    return result;
  }

  if (monitor.method === "TCP") {
  const config = monitor.config as { port?: number } | null;

  if (!config?.port) {
    return null;
  }

  const result = await checkTCP(
    monitor.device.address,
    config.port
  );

  await prisma.monitoringResult.create({
    data: {
      monitorId: monitor.id,
      status: result.status,
      latency: result.latency,
    },
  });

  await aggregateDeviceStatus(monitor.deviceId);

  return result;
}

    if (
  monitor.method === "HTTP" ||
  monitor.method === "HTTPS"
) {
  const config = monitor.config as { url?: string } | null;

  if (!config?.url) {
    return null;
  }

  const result = await checkHTTP(config.url);

  await prisma.monitoringResult.create({
    data: {
      monitorId: monitor.id,
      status: result.status,
      latency: result.latency,
    },
  });

  await aggregateDeviceStatus(monitor.deviceId);

  return {
    status: result.status,
    latency: result.latency,
  };
}

if (monitor.method === "SNMP") {
  const config = monitor.config as {
    community?: string;
    oid?: string;
  } | null;

  const primaryOID = config?.oid ?? "1.3.6.1.2.1.1.1.0";
  const fallbackOID = "1.3.6.1.2.1.1.3.0";

  let result = await checkSNMP(
    monitor.device.address,
    primaryOID,
    config?.community ?? "public"
  );

  if (result.status === "DOWN") {
    result = await checkSNMP(
      monitor.device.address,
      fallbackOID,
      config?.community ?? "public"
    );
  }

  await prisma.monitoringResult.create({
    data: {
      monitorId: monitor.id,
      status: result.status,
      latency: result.latency,
    },
  });

  await aggregateDeviceStatus(monitor.deviceId);

  return result;
}

  return null;
}

export type SupportedDeviceType =
  | "PRINTER"
  | "ROUTER"
  | "SERVER";

export interface MonitorDeviceInput {
  address: string;
  type: SupportedDeviceType;
  community?: string;
}

export interface PrinterMonitorResult {
  type: "PRINTER";
  status: "HEALTHY" | "DOWN";
  latency: number | null;
  metrics: PrinterMetrics | null;
}

export interface RouterMonitorResult {
  type: "ROUTER";
  status: "HEALTHY" | "DOWN";
  latency: number | null;
  metrics: RouterMetrics | null;
}

export interface ServerMonitorResult {
  type: "SERVER";
  status: "HEALTHY" | "DOWN";
  latency: number | null;
  metrics: ServerMetrics | null;
}

export type MonitorDeviceResult =
  | PrinterMonitorResult
  | RouterMonitorResult
  | ServerMonitorResult;

const SNMP_SYSTEM_DESCRIPTION_OID =
  "1.3.6.1.2.1.1.1.0";

export async function monitorDevice(
  device: MonitorDeviceInput
): Promise<MonitorDeviceResult> {
  const community = device.community ?? "public";

  /*
   * Generic SNMP connectivity check.
   *
   * This determines whether the device is reachable
   * before attempting device-specific metric collection.
   */
  const health = await checkSNMP(
    device.address,
    SNMP_SYSTEM_DESCRIPTION_OID,
    community
  );

  if (health.status === "DOWN") {
    return createDownResult(device.type);
  }

  switch (device.type) {
    case "PRINTER": {
      const metrics = await getPrinterMetrics(
        device.address,
        community
      );

      return {
        type: "PRINTER",
        status: "HEALTHY",
        latency: health.latency,
        metrics,
      };
    }

    case "ROUTER": {
      const metrics = await getRouterMetrics(
        device.address,
        community
      );

      return {
        type: "ROUTER",
        status: "HEALTHY",
        latency: health.latency,
        metrics,
      };
    }

    case "SERVER": {
      const metrics = await getServerMetrics(
        device.address,
        community
      );

      return {
        type: "SERVER",
        status: "HEALTHY",
        latency: health.latency,
        metrics,
      };
    }
  }
}

function createDownResult(
  type: SupportedDeviceType
): MonitorDeviceResult {
  switch (type) {
    case "PRINTER":
      return {
        type: "PRINTER",
        status: "DOWN",
        latency: null,
        metrics: null,
      };

    case "ROUTER":
      return {
        type: "ROUTER",
        status: "DOWN",
        latency: null,
        metrics: null,
      };

    case "SERVER":
      return {
        type: "SERVER",
        status: "DOWN",
        latency: null,
        metrics: null,
      };
  }
}