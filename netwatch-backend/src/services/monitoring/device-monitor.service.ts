import type { Device, DeviceType } from "../../generated/prisma/client.js";

import {
  monitorDevice,
  type MonitorDeviceResult,
} from "./monitoring.service.js";

export async function monitorDatabaseDevice(
  device: Device & {
    monitors: {
      method: string;
      enabled: boolean;
      config: unknown;
    }[];
  }
): Promise<MonitorDeviceResult> {
  const snmpMonitor = device.monitors.find(
    (monitor) =>
      monitor.method === "SNMP" &&
      monitor.enabled
  );

  if (!snmpMonitor) {
    throw new Error(
      `Device "${device.name}" is not configured for SNMP monitoring`
    );
  }

  if (
    device.type !== "PRINTER" &&
    device.type !== "ROUTER"
  ) {
    throw new Error(
      `SNMP monitoring is not implemented for ${device.type}`
    );
  }

  return monitorDevice({
    address: device.address,
    type: device.type,
    community: "public",
  });
}