import { SERVER_MIB } from "../../../constants/mibs/server.mib.js";
import { checkSNMP, walkSNMP } from "../snmp.service.js";

export type InterfaceStatus =
  | "UP"
  | "DOWN"
  | "TESTING"
  | "UNKNOWN";

export interface ServerInterface {
  index: number;
  name: string;
  type: string;
  mtu: number;
  speed: number;
  speedMbps: number;
  adminStatus: InterfaceStatus;
  operStatus: InterfaceStatus;
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

/*
 * IF-MIB ifType values.
 */
const INTERFACE_TYPES: Record<number, string> = {
  1: "OTHER",
  2: "REGULAR_1822",
  3: "HDH_1822",
  4: "DDN_X25",
  5: "RFC877_X25",
  6: "ETHERNET",
  7: "ISO88023_CSMACD",
  8: "ISO88024_TOKENBUS",
  9: "ISO88025_TOKENRING",
  10: "ISO88026_MAN",
  11: "STARLAN",
  12: "PROTEON_10MBIT",
  13: "PROTEON_80MBIT",
  14: "HYPERCHANNEL",
  15: "FDDI",
  16: "LAPB",
  17: "SDLC",
  18: "DS1",
  19: "E1",
  20: "BASIC_ISDN",
  21: "PRIMARY_ISDN",
  22: "PROP_POINT_TO_POINT_SERIAL",
  23: "PPP",
  24: "SOFTWARE_LOOPBACK",
  25: "EON",
  26: "ETHERNET_3MBIT",
  27: "NSIP",
  28: "SLIP",
  29: "ULTRA",
  30: "DS3",
  31: "SIP",
  32: "FRAMERELAY",
  53: "HIPPI",
  62: "IEEE80211",
  71: "IEEE80212",
  131: "TUNNEL",
  135: "L2VLAN",
  136: "L3IPVLAN",
  161: "IEEE8023ADLAG",
};

function normalizeInterfaceType(value: unknown): string {
  const type = Number(value);
  return INTERFACE_TYPES[type] ?? "UNKNOWN";
}

function normalizeSpeed(value: unknown): number {
  const speed = Number(value);
  if (!Number.isFinite(speed) || speed < 0) {
    return 0;
  }
  return speed / 1_000_000;
}

function normalizeInterfaceStatus(
  value: unknown
): InterfaceStatus {
  switch (Number(value)) {
    case 1:
      return "UP";
    case 2:
      return "DOWN";
    case 3:
      return "TESTING";
    default:
      return "UNKNOWN";
  }
}

function toStringValue(value: unknown): string {
  if (value instanceof Buffer) {
    return value.toString();
  }
  return String(value ?? "");
}

function toNumberOrNull(value: unknown): number | null {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export async function getServerInterfaces(
  address: string,
  community = "public"
): Promise<ServerInterface[]> {
  const results = await walkSNMP(
    address,
    SERVER_MIB.network.interfaces.base,
    community
  );

  const interfaces = new Map<number, ServerInterface>();

  for (const vb of results) {
    const parts = vb.oid.split(".").map(Number);
    const column = parts[10];
    const index = parts[11];

    if (index === undefined) {
      continue;
    }

    if (!interfaces.has(index)) {
      interfaces.set(index, {
        index,
        name: "",
        type: "UNKNOWN",
        mtu: 0,
        speed: 0,
        speedMbps: 0,
        adminStatus: "UNKNOWN",
        operStatus: "UNKNOWN",
        bytesIn: 0,
        bytesOut: 0,
        inputErrors: 0,
        outputErrors: 0,
      });
    }

    const networkInterface = interfaces.get(index)!;

    switch (column) {
      case 2:
        networkInterface.name = toStringValue(vb.value);
        break;
      case 3:
        networkInterface.type = normalizeInterfaceType(vb.value);
        break;
      case 4:
        networkInterface.mtu = Number(vb.value);
        break;
      case 5: {
        const speed = Number(vb.value);
        networkInterface.speed = speed;
        networkInterface.speedMbps = normalizeSpeed(speed);
        break;
      }
      case 7:
        networkInterface.adminStatus = normalizeInterfaceStatus(vb.value);
        break;
      case 8:
        networkInterface.operStatus = normalizeInterfaceStatus(vb.value);
        break;
      case 10:
        networkInterface.bytesIn = Number(vb.value);
        break;
      case 14:
        networkInterface.inputErrors = Number(vb.value);
        break;
      case 16:
        networkInterface.bytesOut = Number(vb.value);
        break;
      case 20:
        networkInterface.outputErrors = Number(vb.value);
        break;
    }
  }

  return Array.from(interfaces.values());
}

export async function getServerCPUUsage(
  address: string,
  community = "public"
): Promise<number | null> {
  try {
    const results = await walkSNMP(
      address,
      SERVER_MIB.resources.processor.base,
      community
    );

    const loads = results
      .map((vb) => Number(vb.value))
      .filter(
        (value) =>
          Number.isFinite(value) &&
          value >= 0 &&
          value <= 100
      );

    if (loads.length === 0) {
      return null;
    }

    const total = loads.reduce((sum, value) => sum + value, 0);
    return total / loads.length;
  } catch {
    return null;
  }
}

export async function getServerMemory(
  address: string,
  community = "public"
): Promise<{
  memoryTotal: number | null;
  memoryUsed: number | null;
  memoryUsage: number | null;
}> {
  try {
    const results = await walkSNMP(
      address,
      SERVER_MIB.resources.storage.base,
      community
    );

    const HR_STORAGE_RAM = "1.3.6.1.2.1.25.2.1.2";

    interface StorageEntry {
      type: string;
      allocationUnits: number;
      size: number;
      used: number;
    }

    const storage = new Map<number, StorageEntry>();

    for (const vb of results) {
      const parts = vb.oid.split(".").map(Number);
      const column = parts[10];
      const index = parts[11];

      if (index === undefined) {
        continue;
      }

      if (!storage.has(index)) {
        storage.set(index, {
          type: "",
          allocationUnits: 0,
          size: 0,
          used: 0,
        });
      }

      const entry = storage.get(index)!;

      switch (column) {
        case 2:
          entry.type = toStringValue(vb.value);
          break;
        case 4:
          entry.allocationUnits = Number(vb.value);
          break;
        case 5:
          entry.size = Number(vb.value);
          break;
        case 6:
          entry.used = Number(vb.value);
          break;
      }
    }

    const memory = Array.from(storage.values()).find(
      (entry) => entry.type === HR_STORAGE_RAM
    );

    if (!memory) {
      return {
        memoryTotal: null,
        memoryUsed: null,
        memoryUsage: null,
      };
    }

    const totalBytes = memory.size * memory.allocationUnits;
    const usedBytes = memory.used * memory.allocationUnits;
    const usage = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : null;

    return {
      memoryTotal: totalBytes,
      memoryUsed: usedBytes,
      memoryUsage: usage,
    };
  } catch {
    return {
      memoryTotal: null,
      memoryUsed: null,
      memoryUsage: null,
    };
  }
}

export async function getServerDisks(
  address: string,
  community = "public"
): Promise<DiskStorage[]> {
  try {
    const results = await walkSNMP(
      address,
      SERVER_MIB.resources.disk.base,
      community
    );

    const HR_STORAGE_FIXED_DISK = "1.3.6.1.2.1.25.2.1.4";

    interface StorageEntry {
      type: string;
      description: string;
      allocationUnits: number;
      size: number;
      used: number;
    }

    const storage = new Map<number, StorageEntry>();

    for (const vb of results) {
      const parts = vb.oid.split(".").map(Number);
      const column = parts[10];
      const index = parts[11];

      if (index === undefined) {
        continue;
      }

      if (!storage.has(index)) {
        storage.set(index, {
          type: "",
          description: "",
          allocationUnits: 0,
          size: 0,
          used: 0,
        });
      }

      const entry = storage.get(index)!;

      switch (column) {
        case 2:
          entry.type = toStringValue(vb.value);
          break;
        case 3:
          entry.description = toStringValue(vb.value);
          break;
        case 4:
          entry.allocationUnits = Number(vb.value);
          break;
        case 5:
          entry.size = Number(vb.value);
          break;
        case 6:
          entry.used = Number(vb.value);
          break;
      }
    }

    const disks = Array.from(storage.entries())
      .filter(([, entry]) => entry.type === HR_STORAGE_FIXED_DISK)
      .map(([index, entry]) => {
        const totalBytes = entry.size * entry.allocationUnits;
        const usedBytes = entry.used * entry.allocationUnits;
        const sizeGB = totalBytes / (1024 * 1024 * 1024);
        const usedGB = usedBytes / (1024 * 1024 * 1024);
        const usagePercent = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;

        return {
          index,
          description: entry.description,
          type: entry.type,
          allocationUnits: entry.allocationUnits,
          size: entry.size,
          used: entry.used,
          sizeGB,
          usedGB,
          usagePercent,
        };
      });

    return disks;
  } catch {
    return [];
  }
}

export async function getServerResources(
  address: string,
  community = "public"
): Promise<ServerResources> {
  const [cpuUsage, memory] = await Promise.all([
    getServerCPUUsage(address, community),
    getServerMemory(address, community),
  ]);

  return {
    cpuUsage,
    memoryTotal: memory.memoryTotal,
    memoryUsed: memory.memoryUsed,
    memoryUsage: memory.memoryUsage,
  };
}

export async function getServerMetrics(
  address: string,
  community = "public"
): Promise<ServerMetrics> {
  const [
    description,
    objectId,
    uptime,
    name,
    location,
    interfaces,
    resources,
    disks,
  ] = await Promise.all([
    checkSNMP(address, SERVER_MIB.system.description, community),
    checkSNMP(address, SERVER_MIB.system.objectId, community),
    checkSNMP(address, SERVER_MIB.system.uptime, community),
    checkSNMP(address, SERVER_MIB.system.name, community),
    checkSNMP(address, SERVER_MIB.system.location, community),
    getServerInterfaces(address, community),
    getServerResources(address, community),
    getServerDisks(address, community),
  ]);

  return {
    description: toStringValue(description.value),
    objectId: toStringValue(objectId.value),
    uptime: uptime.value !== undefined ? toNumberOrNull(uptime.value) : null,
    name: toStringValue(name.value),
    location: toStringValue(location.value),
    interfaces,
    resources,
    disks,
  };
}