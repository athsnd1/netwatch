import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { getOrCreateUser } from "../services/user.service.js";

export async function requireAuth (req: Request, res: Response, next: NextFunction) {

    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated || !userId) {
        res.status(401).json({ message: "Failed to authenticate user" });
        return;
    }

    try {

        const user = await getOrCreateUser(userId);

        req.user = user!;

        next();
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to authenticate user" });
    }

}