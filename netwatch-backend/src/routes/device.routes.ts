import { Router } from "express";
import * as DeviceController from "../controllers/device.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createDeviceSchema, createMonitorSchema, updateMonitorSchema, createNestedMonitorSchema } from "../validators/device.validator.js";
import { updateDeviceSchema } from "../validators/device.validator.js";

const router = Router();

router.post("/", validate(createDeviceSchema), DeviceController.createDeviceController);

router.get("/", DeviceController.getDevicesController);

router.get("/:id/monitors/:monitorId/results", DeviceController.getMonitorResultsController);

router.get("/:id/monitors", DeviceController.getMonitorsController);

router.get("/:id/metrics", DeviceController.getDeviceMetricsController);

router.get("/:id", DeviceController.getSingleDeviceController);

router.patch("/:id/monitors/:monitorId", validate(updateMonitorSchema), DeviceController.updateMonitorController);

router.patch("/:id", validate(updateDeviceSchema), DeviceController.updateDeviceController);

router.delete("/:id/monitors/:monitorId", DeviceController.deleteMonitorController);

router.delete("/:id", DeviceController.deleteDeviceController);

router.post("/:id/monitors", validate(createNestedMonitorSchema), DeviceController.createNestedMonitorController);

export default router;