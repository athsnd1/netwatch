import { z } from "zod";

export const webServerCheckSchema = z.object({
  url: z.string().url(),
});

export const webServerMonitorSchema = z.object({
  url: z.string().url(),
  duration: z.number().int().min(1000).max(300000).optional().default(60000),
  interval: z.number().int().min(1000).max(60000).optional().default(5000),
});