require("dotenv/config");
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('../../generated/prisma/client')

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })


async function connectToDatabase() {
    try {
        await prisma.$connect();
        console.log("Database connected successfully.");
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
}

connectToDatabase();

module.exports = { prisma }