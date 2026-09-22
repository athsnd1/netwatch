import ping from "ping";
import type { DeviceStatus } from "../../generated/prisma/enums.js";

export async function checkICMP(address: string) {
  const result = await ping.promise.probe(address);

  return {
    status: result.alive
      ? ("HEALTHY" as DeviceStatus)
      : ("DOWN" as DeviceStatus),

    latency: result.alive ? Number(result.time) : null,
  };
}