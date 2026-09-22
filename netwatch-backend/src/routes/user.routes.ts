import { Router } from "express";
import { getCurrentClerkUser } from "../controllers/user.controller.js";

const router = Router();

router.get("/me", getCurrentClerkUser);

export default router;