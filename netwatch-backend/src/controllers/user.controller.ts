import type { Request, Response } from "express";

export function getCurrentClerkUser (req: Request, res: Response) {
    return res.json(req.user);
};