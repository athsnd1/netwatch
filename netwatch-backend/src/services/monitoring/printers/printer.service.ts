import { PRINTER_MIB } from "../../../constants/mibs/printer.mib.js";
import { checkSNMP, walkSNMP } from "../snmp.service.js";

export interface SNMPConsumable {
  index: number;
  name: string;
  level: number;
  maxLevel: number;
  unit: number;
}

export interface PrinterMetrics {
  description: string;
  serialNumber: string;
  status: PrinterStatus | null;
  pageCount: number | null;
  cartridges: SNMPConsumable[];
}

export interface PrinterStatus {
  rawStatus: number;
  availability:
    | "IDLE"
    | "ON_REQUEST"
    | "STANDBY"
    | "BROKEN"
    | "ACTIVE"
    | "UNKNOWN"
    | "BUSY";
  hasNonCriticalAlert: boolean;
  hasCriticalAlert: boolean;
  isOffline: boolean;
  isTransitioning: boolean;
}

function decodePrinterStatus(rawStatus: number): PrinterStatus {
  const availabilityCode = rawStatus & 0b111;

  let availability: PrinterStatus["availability"];

  switch (availabilityCode) {
    case 0:
      availability = "IDLE";
      break;

    case 1:
      availability = "ON_REQUEST";
      break;

    case 2:
      availability = "STANDBY";
      break;

    case 3:
      availability = "BROKEN";
      break;

    case 4:
      availability = "ACTIVE";
      break;

    case 5:
      availability = "UNKNOWN";
      break;

    case 6:
      availability = "BUSY";
      break;

    default:
      availability = "UNKNOWN";
  }

  return {
    rawStatus,
    availability,
    hasNonCriticalAlert: (rawStatus & 8) !== 0,
    hasCriticalAlert: (rawStatus & 16) !== 0,
    isOffline: (rawStatus & 32) !== 0,
    isTransitioning: (rawStatus & 64) !== 0,
  };
}

export async function getPrinterConsumables(
  address: string,
  community = "public"
): Promise<SNMPConsumable[]> {
  const results = await walkSNMP(
    address,
    PRINTER_MIB.supplies.base,
    community
  );

  const consumables = new Map<number, SNMPConsumable>();

  for (const vb of results) {
    const parts = vb.oid.split(".").map(Number);

    const column = parts[10];
    const index = parts[12];

    if (index === undefined) {
      continue;
    }

    if (!consumables.has(index)) {
      consumables.set(index, {
        index,
        name: "",
        level: 0,
        maxLevel: 0,
        unit: 0,
      });
    }

    const consumable = consumables.get(index)!;

    switch (column) {
      case 6:
        consumable.name = String(vb.value);
        break;

      case 7:
        consumable.unit = Number(vb.value);
        break;

      case 8:
        consumable.maxLevel = Number(vb.value);
        break;

      case 9:
        consumable.level = Number(vb.value);
        break;
    }
  }

  return Array.from(consumables.values());
};

export async function getPrinterMetrics(address: string, community = "public"): Promise<PrinterMetrics> {
  const [description, serialNumber, pageCount, cartridges, printerStatus] =
    await Promise.all([
      checkSNMP(address, PRINTER_MIB.description, community),
      checkSNMP(address, PRINTER_MIB.serialNumber, community),
      checkSNMP(address, PRINTER_MIB.lifeCount, community),
      getPrinterConsumables(address, community),
      getPrinterStatus(address, community),
    ]);

    const parsedPageCount =
    pageCount.value !== undefined
        ? Number(pageCount.value)
        : null;

  return {
    description:
        description.value instanceof Buffer
        ? description.value.toString()
        : String(description.value ?? ""),

    serialNumber:
        serialNumber.value instanceof Buffer
        ? serialNumber.value.toString()
        : String(serialNumber.value ?? ""),

    status: printerStatus,

    pageCount: parsedPageCount,

    cartridges,
    };
}

export async function getPrinterStatus(address: string, community = "public"): Promise<PrinterStatus | null> {
  const result = await checkSNMP(
    address,
    PRINTER_MIB.markerStatus,
    community
  );

  if (result.status === "DOWN" || result.value === undefined) {
    return null;
  }

  return decodePrinterStatus(Number(result.value));
}