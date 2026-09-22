import { Router } from "express";
import * as MonitorController from "../controllers/monitor.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createMonitorSchema, updateMonitorSchema } from "../validators/device.validator.js";

const router = Router();

router.post("/", validate(createMonitorSchema), MonitorController.createMonitorController);

router.get("/", MonitorController.getAllMonitorsController);

router.get("/:id", MonitorController.getMonitorController);

router.get("/:id/results", MonitorController.getMonitorResultsController);

router.patch("/:id", validate(updateMonitorSchema), MonitorController.updateMonitorController);

router.delete("/:id", MonitorController.deleteMonitorController);

export default router;