import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkDbConnection() {
  try {
    await prisma.$connect();  // Try connecting to the database
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  } finally {
    await prisma.$disconnect();  // Close the connection
  }
}

export default checkDbConnection;