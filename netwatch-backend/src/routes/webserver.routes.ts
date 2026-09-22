import { Router } from "express";
import * as WebServerController from "../controllers/webserver.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { webServerCheckSchema, webServerMonitorSchema } from "../validators/webserver.validator.js";

const router = Router();

router.post("/check", validate(webServerCheckSchema), WebServerController.checkWebServerController);

router.get("/metrics", WebServerController.getWebServerMetricsController);

router.post("/monitor", validate(webServerMonitorSchema), WebServerController.monitorWebServerController);

export default router;