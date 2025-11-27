const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
require("dotenv/config");
const { env } = require("node:process");
const { PrismaClient } = require("../../generated/prisma");

const connectionString = `${env.DATABASE_URL}`;

const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;