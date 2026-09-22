import "dotenv/config";
import prisma from "./lib/prisma.js";

async function main () {
    const users = await prisma.user.findMany();

    console.log("Database succesfully connected");
    console.log(users);
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});