import prisma from "../lib/prisma.js";
import type { MonitoringMethod } from "../generated/prisma/enums.js";
import type { Prisma } from "../generated/prisma/client.js";

export async function createMonitor(
  userId: string,
  data: {
    deviceId: string;
    method: MonitoringMethod;
    config?: Record<string, unknown>;
  }
) {
  const device = await prisma.device.findFirst({
    where: {
      id: data.deviceId,
      userId,
    },
  });

  if (!device) {
    return null;
  }

  // Check if a monitor with the same method already exists for this device
  const existingMonitor = await prisma.deviceMonitor.findFirst({
    where: {
      deviceId: data.deviceId,
      method: data.method,
    },
  });

  if (existingMonitor) {
    // Return the existing monitor instead of creating a duplicate
    return existingMonitor;
  }

  return await prisma.deviceMonitor.create({
    data: {
      deviceId: data.deviceId,
      method: data.method,
      ...(data.config !== undefined && {
        config: data.config as Prisma.InputJsonValue,
      }),
    },
  });
}

export async function getAllMonitors(userId: string) {
  return await prisma.deviceMonitor.findMany({
    where: {
      device: {
        userId,
      },
    },
    include: {
      device: true,
    },
  });
}

export async function getMonitor(userId: string, monitorId: string) {
  return await prisma.deviceMonitor.findFirst({
    where: {
      id: monitorId,
      device: {
        userId,
      },
    },
    include: {
      device: true,
    },
  });
}

export async function getMonitorResults(userId: string, monitorId: string) {
  const monitor = await prisma.deviceMonitor.findFirst({
    where: {
      id: monitorId,
      device: {
        userId,
      },
    },
  });

  if (!monitor) {
    return null;
  }

  return prisma.monitoringResult.findMany({
    where: {
      monitorId,
    },
    orderBy: {
      checkedAt: "desc",
    },
  });
}

export async function updateMonitor(
  userId: string,
  monitorId: string,
  data: {
    config?: Record<string, unknown>;
    enabled?: boolean;
  }
) {
  const monitor = await prisma.deviceMonitor.findFirst({
    where: {
      id: monitorId,
      device: {
        userId,
      },
    },
  });

  if (!monitor) {
    return null;
  }

  return prisma.deviceMonitor.update({
    where: {
      id: monitorId,
    },
    data: {
      ...(data.config !== undefined && {
        config: data.config as Prisma.InputJsonValue,
      }),
      ...(data.enabled !== undefined && {
        enabled: data.enabled,
      }),
    },
  });
}

export async function deleteMonitor(userId: string, monitorId: string) {
  const monitor = await prisma.deviceMonitor.findFirst({
    where: {
      id: monitorId,
      device: {
        userId,
      },
    },
  });

  if (!monitor) {
    return null;
  }

  return prisma.deviceMonitor.delete({
    where: {
      id: monitorId,
    },
  });
}