import express, { type Request, type Response } from "express";
import { verifyWebhook } from "@clerk/express/webhooks";
import { deleteUser, updateUser } from "../services/user.service.js";

const webhookRouter = express.Router();

interface ClerkUserData {
    firstName: string;
    lastName: string;
}

webhookRouter.post("/clerk", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {

    try {

        const event = await verifyWebhook(req);

        const userId = event.data.id;

        if (event.type === "user.deleted") {
            await deleteUser(userId as string);
        } else if (event.type === "user.updated") {
            const clerkUserData: ClerkUserData = { firstName: event.data.first_name!, lastName: event.data.last_name! };
            await updateUser(userId as string, clerkUserData);
        }

        return res.status(200).json({ received: true });
        
    } catch (error) {
        console.error("Webhook verification failed: ", error);
        return res.status(400).json({ error: "Invalid webhook" });
    }

});

export default webhookRouter;