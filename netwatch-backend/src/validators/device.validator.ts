import { z } from "zod";

const monitorSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("ICMP"),
    config: z.undefined().optional(),
  }),

  z.object({
    method: z.literal("TCP"),
    config: z.object({
      port: z.number().int().min(1).max(65535),
    }),
  }),

  z.object({
    method: z.literal("HTTP"),
    config: z.object({
      url: z.string().url(),
    }),
  }),

  z.object({
    method: z.literal("HTTPS"),
    config: z.object({
      url: z.string().url(),
    }),
  }),

  z.object({
    method: z.literal("SNMP"),
    config: z.record(z.string(), z.unknown()).optional(),
  }),
]);

export const createDeviceSchema = z.object({
  name: z.string().min(1),
  type: z.enum([
    "ROUTER",
    "SERVER",
    "WEB_SERVER",
    "PRINTER",
    "PC",
    "PHONE",
  ]),
  address: z.string().min(1),
  monitors: z.array(monitorSchema).min(1),
});

export const updateDeviceSchema = z.object({
  name: z.string().min(1).optional(),

  type: z.enum([
    "ROUTER",
    "SERVER",
    "WEB_SERVER",
    "PRINTER",
    "PC",
    "PHONE",
  ]).optional(),

  address: z.string().min(1).optional(),
});

export const createMonitorSchema = z.discriminatedUnion("method", [
  z.object({
    deviceId: z.string().uuid(),
    method: z.literal("ICMP"),
    config: z.undefined().optional(),
  }),

  z.object({
    deviceId: z.string().uuid(),
    method: z.literal("TCP"),
    config: z.object({
      port: z.number().int().min(1).max(65535),
    }),
  }),

  z.object({
    deviceId: z.string().uuid(),
    method: z.literal("HTTP"),
    config: z.object({
      url: z.string().url(),
    }),
  }),

  z.object({
    deviceId: z.string().uuid(),
    method: z.literal("HTTPS"),
    config: z.object({
      url: z.string().url(),
    }),
  }),

  z.object({
    deviceId: z.string().uuid(),
    method: z.literal("SNMP"),
    config: z.record(z.string(), z.unknown()).optional(),
  }),
]);

// Schema for nested route (deviceId in URL, not body)
export const createNestedMonitorSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("ICMP"),
    config: z.undefined().optional(),
  }),

  z.object({
    method: z.literal("TCP"),
    config: z.object({
      port: z.number().int().min(1).max(65535),
    }),
  }),

  z.object({
    method: z.literal("HTTP"),
    config: z.object({
      url: z.string().url(),
    }),
  }),

  z.object({
    method: z.literal("HTTPS"),
    config: z.object({
      url: z.string().url(),
    }),
  }),

  z.object({
    method: z.literal("SNMP"),
    config: z.record(z.string(), z.unknown()).optional(),
  }),
]);

export const updateMonitorSchema = z.object({
  config: z.record(z.string(), z.unknown()).optional(),
  enabled: z.boolean().optional(),
});