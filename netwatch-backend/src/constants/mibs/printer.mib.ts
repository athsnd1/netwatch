export const PRINTER_MIB = {
  description: "1.3.6.1.2.1.43.5.1.1.16.1",
  serialNumber: "1.3.6.1.2.1.43.5.1.1.17.1",
  lifeCount: "1.3.6.1.2.1.43.10.2.1.4.1.1",

  markerStatus: "1.3.6.1.2.1.43.10.2.1.15.1.1",

  supplies: {
    base: "1.3.6.1.2.1.43.11.1.1",
    description: "1.3.6.1.2.1.43.11.1.1.6",
    supplyUnit: "1.3.6.1.2.1.43.11.1.1.7",
    maxCapacity: "1.3.6.1.2.1.43.11.1.1.8",
    level: "1.3.6.1.2.1.43.11.1.1.9",
  },
} as const;