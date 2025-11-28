import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client.js'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })


export async function connectToDatabase() {
    try {
        await prisma.$connect();
        console.log("Database connected successfully.");
        return "Database connected successfully.";
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
        return "Database connection failed.";
    }
}

export default prisma