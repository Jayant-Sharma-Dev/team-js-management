import { PrismaClient } from "@prisma/client/extension";
export const prisma = new PrismaClient();

//Database helper function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error(`Connection failed: ${error}`)
    return false;
  }
}