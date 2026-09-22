import prisma from "../lib/prisma.js";
import type { DeviceType, MonitoringMethod } from "../generated/prisma/enums.js";
import type { Prisma } from "../generated/prisma/client.js";
import redis from "../config/redis.config.js";

type CreateDeviceData = {
    name: string;
    type: DeviceType;
    address: string;
    monitors: {
        method: MonitoringMethod,
        config?: Record<string, unknown> | null
    }[];
}

export async function createDevice (userId: string, data: CreateDeviceData) {

        const device = await prisma.device.create({
            data: {
                userId,
                name: data.name,
                type: data.type,
                address: data.address,

                monitors: {
                    create: data.monitors.map((monitor) => ({
                                method: monitor.method,
                                ...(monitor.config ? {
                                    config: monitor.config as Prisma.InputJsonValue,
                                    }
                                : {}),
                            })),
                },
            },
            
            include: {
                monitors: true
            }
        });

        await redis.del(`devices:${userId}`);

        return device;
};

export async function getDevices (userId: string) {

    if (!userId) {
        return [];
    }

    const key = `devices:${userId}`;

    const cached = await redis.get(key);

    if (cached) {
        return JSON.parse(cached);
    }

    const devices = await prisma.device.findMany({
        where: {
            userId
        },
        include: {
            monitors: true
        }
    });

    await redis.set(
      key,
      JSON.stringify(devices),
      {
        EX: 60
      }
    );

    return devices;
};

export async function getSingleDevice (userId: string, deviceId: string) {

    const key = `device:${deviceId}`;

    const cache = await redis.get(key);

    if (cache) {
      return JSON.parse(cache);
    }

    const device = await prisma.device.findFirst({
        where: {
            id: deviceId,
            userId,
        },
        include: {
            monitors: true
        }
    });

    if (!device) {
      return null;
    }

    await redis.set(
      key,
      JSON.stringify(device),
      {
        EX: 60
      }
    );

    return device;
};

export async function deleteDevice (userId: string, deviceId: string) {

    await redis.del(`devices:${userId}`);

    return await prisma.device.deleteMany({
        where: {
            id: deviceId,
            userId
        }
    });
    
};

export async function updateDevice(
  userId: string,
  deviceId: string,
  data: {
    name?: string;
    type?: DeviceType;
    address?: string;
  }
) 

{
  await redis.del(`devices:${userId}`); 

  return await prisma.device.updateMany({
    where: {
      id: deviceId,
      userId,
    },
    data,
  });
};

export async function createMonitor(
  userId: string,
  deviceId: string,
  data: {
    method: MonitoringMethod;
    config?: Record<string, unknown>;
  }
) {
  const device = await prisma.device.findFirst({
    where: {
      id: deviceId,
      userId,
    },
  });

  if (!device) {
    return null;
  }

  await redis.del(`devices:${userId}`);

  return await prisma.deviceMonitor.create({
    data: {
      deviceId,
      method: data.method,
      ...(data.config !== undefined && {
        config: data.config as Prisma.InputJsonValue,
      }),
    },
  });
};

export async function getMonitors(
  userId: string,
  deviceId: string
) {
  const device = await prisma.device.findFirst({
    where: {
      id: deviceId,
      userId,
    },
  });

  if (!device) {
    return null;
  }

  await redis.del(`devices:${userId}`);

  return prisma.deviceMonitor.findMany({
    where: {
      deviceId,
    },
  });
};

export async function deleteMonitor(
  userId: string,
  deviceId: string,
  monitorId: string
) {

  const monitor = await prisma.deviceMonitor.findFirst({
    where: {
      id: monitorId,
      deviceId,
      device: {
        userId,
      },
    },
  });

  if (!monitor) {
    return null;
  }

  await redis.del(`devices:${userId}`);

  return prisma.deviceMonitor.delete({
    where: {
      id: monitorId,
    },
  });
};

export async function updateMonitor(
  userId: string,
  deviceId: string,
  monitorId: string,
  data: {
    config?: Record<string, unknown>;
    enabled?: boolean;
  }
) {
  
  
  const monitor = await prisma.deviceMonitor.findFirst({
    where: {
      id: monitorId,
      deviceId,
      device: {
        userId,
      },
    },
  });
  
  if (!monitor) {
    return null;
  }
  
  await redis.del(`devices:${userId}`);

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
};

export async function getMonitorResults(
  userId: string,
  deviceId: string,
  monitorId: string
) {
  const monitor = await prisma.deviceMonitor.findFirst({
    where: {
      id: monitorId,
      deviceId,
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
};