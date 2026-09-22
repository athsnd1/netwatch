import * as DeviceService from "../services/device.service.js";
import * as PrinterService from "../services/monitoring/printers/printer.service.js";
import * as RouterService from "../services/monitoring/routers/router.service.js";
import * as ServerService from "../services/monitoring/servers/server.service.js";
import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";


export async function createDeviceController (req: Request, res: Response) {
    try {
        const userId = req.user!.id;
        const device = await DeviceService.createDevice(userId, req.body);
        res.status(201).json(device);
    } catch (error) { 
        console.error("Failed to create device: ", error);
        return res.status(500).json({ message: "Failed to create device" });
    }
};

export async function getDevicesController (req: Request, res: Response) {

    try {

        const userId = req.user!.id;

        const devices = await DeviceService.getDevices(userId);

        res.status(200).json(devices);
        
    } catch (error) {
        
        console.error("Failed to get devices: ", error);
        return res.status(500).json({ message: "Failed to get devices" });

    }
};

export async function getSingleDeviceController (req: Request, res: Response) {

    try {

        const userId = req.user!.id;
        const deviceId = req.params.id;

        const device = await DeviceService.getSingleDevice(userId, deviceId as string);

        if (!device) {
            return res.status(404).json({ message: "Device not found" });
        }

        return res.status(200).json(device);
        
    } catch (error) {
        console.error("Failed to get device: ", error);
        return res.status(500).json({ message: "Failed to get device" });
    }
};

export async function deleteDeviceController (req: Request, res: Response) {

    try {

        const userId = req.user!.id;
        const { id: deviceId } = req.params;

        const deletedDevice = await DeviceService.deleteDevice(userId, deviceId as string);

        if (deletedDevice.count === 0) {
            return res.status(404).json({ message: "Device not found" });
        }

        return res.status(200).json({ message: "Device successfully deleted" });
        
    } catch (error) {
        console.error("Failed to delete device: ", error);
        return res.status(500).json({ message: "Failed to delete device" });
    }

};

export async function updateDeviceController(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user!.id;
    const { id: deviceId } = req.params;

    const result = await DeviceService.updateDevice(
      userId,
      deviceId as string,
      req.body
    );

    if (result.count === 0) {
      return res.status(404).json({
        message: "Device not found",
      });
    }

    return res.status(200).json({
      message: "Device successfully updated",
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({
        message: "This monitoring method already exists for this device",
      });
    }

    console.error("Failed to create monitor:", error);

    return res.status(500).json({
      message: "Failed to create monitor",
    });
  }
};

export async function createMonitorController(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id: deviceId } = req.params;

    const monitor = await DeviceService.createMonitor(
      userId,
      deviceId as string,
      req.body
    );

    if (!monitor) {
      return res.status(404).json({
        message: "Device not found",
      });
    }

    return res.status(201).json(monitor);
  } catch (error) {
    console.error("Failed to create monitor:", error);

    return res.status(500).json({
      message: "Failed to create monitor",
    });
  }
};

export async function createNestedMonitorController(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id: deviceId } = req.params;

    // Extract deviceId from URL and combine with request body
    const monitorData = {
      ...req.body,
      deviceId: deviceId as string
    };

    const monitor = await DeviceService.createMonitor(
      userId,
      deviceId as string,
      monitorData
    );

    if (!monitor) {
      return res.status(404).json({
        message: "Device not found",
      });
    }

    return res.status(201).json(monitor);
  } catch (error) {
    console.error("Failed to create monitor:", error);

    return res.status(500).json({
      message: "Failed to create monitor",
    });
  }
}

export async function getMonitorsController(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id: deviceId } = req.params;

    const monitors = await DeviceService.getMonitors(
      userId,
      deviceId as string
    );

    if (monitors === null) {
      return res.status(404).json({
        message: "Device not found",
      });
    }

    return res.status(200).json(monitors);
  } catch (error) {
    console.error("Failed to get monitors:", error);

    return res.status(500).json({
      message: "Failed to get monitors",
    });
  }
};

export async function deleteMonitorController(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user!.id;
    const { id: deviceId, monitorId } = req.params;

    const monitor = await DeviceService.deleteMonitor(
      userId,
      deviceId as string,
      monitorId as string
    );

    if (!monitor) {
      return res.status(404).json({
        message: "Monitor not found",
      });
    }

    return res.status(200).json({
      message: "Monitor successfully deleted",
    });
  } catch (error) {
    console.error("Failed to delete monitor:", error);

    return res.status(500).json({
      message: "Failed to delete monitor",
    });
  }
};

export async function updateMonitorController(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user!.id;
    const { id: deviceId, monitorId } = req.params;

    const monitor = await DeviceService.updateMonitor(
      userId,
      deviceId as string,
      monitorId as string,
      req.body
    );

    if (!monitor) {
      return res.status(404).json({
        message: "Monitor not found",
      });
    }

    return res.status(200).json(monitor);
  } catch (error) {
    console.error("Failed to update monitor:", error);

    return res.status(500).json({
      message: "Failed to update monitor",
    });
  }
};

export async function getMonitorResultsController(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user!.id;
    const { id: deviceId, monitorId } = req.params;

    const results = await DeviceService.getMonitorResults(
      userId,
      deviceId as string,
      monitorId as string
    );

    if (results === null) {
      return res.status(404).json({
        message: "Monitor not found",
      });
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error("Failed to get monitor results:", error);

    return res.status(500).json({
      message: "Failed to get monitor results",
    });
  }
}

export async function getDeviceMetricsController(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user!.id;
    const { id: deviceId } = req.params;

    const device = await DeviceService.getSingleDevice(userId, deviceId as string);

    if (!device) {
      return res.status(404).json({
        message: "Device not found",
      });
    }

    let metrics: any = null;

    // Get SNMP monitor configuration
    const snmpMonitor = device.monitors.find((m: any) => m.method === "SNMP");
    const config = snmpMonitor?.config as { community?: string } | null;
    const community = config?.community || "public";

    // Fetch device-specific metrics based on type
    try {
      switch (device.type) {
        case "PRINTER":
          metrics = await PrinterService.getPrinterMetrics(device.address, community);
          break;
        case "ROUTER":
          metrics = await RouterService.getRouterMetrics(device.address, community);
          break;
        case "SERVER":
          metrics = await ServerService.getServerMetrics(device.address, community);
          break;
        default:
          metrics = { message: "No specific metrics available for this device type" };
      }
    } catch (serviceError) {
      console.error(`Failed to get ${device.type} metrics for device ${deviceId}:`, serviceError);
      // Return a graceful fallback instead of 500 error
      metrics = { 
        message: `Unable to fetch ${device.type.toLowerCase()} metrics at this time`,
        error: serviceError instanceof Error ? serviceError.message : "Unknown error"
      };
    }

    // Add cache control headers to prevent browser caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    return res.status(200).json(metrics);
  } catch (error) {
    console.error("Failed to get device metrics:", error);

    return res.status(500).json({
      message: "Failed to get device metrics",
    });
  }
}