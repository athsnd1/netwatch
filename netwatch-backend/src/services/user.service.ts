import { clerkClient } from "@clerk/express";
import prisma from "../lib/prisma.js";


export async function getClerkUser (clerkId: string) {
    return await clerkClient.users.getUser(clerkId);
}

export async function getOrCreateUser (clerkId: string) {

    const userExists = await prisma.user.findUnique({
        where: {
            clerkId: clerkId
        }
    });

    if (userExists) {
        return userExists;
    }

    const clerkUser = await getClerkUser(clerkId);

    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
        throw new Error("Clerk user does not have an email address");
    }

    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

    const createUser = await prisma.user.create({
        data: {
            clerkId: clerkUser.id,
            email,
            name
        }
    });

    return createUser;
};

export async function deleteUser (clerkId: string) {

    try {

        const clerkUser = await prisma.user.findUnique({
            where: {
                clerkId
            }
        });

        if (!clerkUser) {
            throw new Error("User does not exist");
        }
        
        await prisma.user.delete({
            where: {
                clerkId
            }
        });
        
    } catch (error) {
        console.error("Failed to delete user: ", error);
    }

};

export async function updateUser (clerkId: string, userData: { firstName: string, lastName: string }) {
    try {

        const clerkUser = await prisma.user.findUnique({
            where: {
                clerkId
            }
        });

        if (!clerkUser) {
            throw new Error("User does not exist");
        }

        console.log("Clerk webhook changed user details for: ", userData.firstName);

        const fullName = [userData.firstName, userData.lastName].filter(Boolean).join(" ") || null;

        await prisma.user.update({
            where: {
                clerkId
            },
            data: {
                name: fullName
            }
        })
        
    } catch (error) {
        console.error("Failed to update user details: ", error);
    }
}