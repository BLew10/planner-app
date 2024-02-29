const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function deletePurchases() {
  try {
    await prisma.purchaseSlot.deleteMany();
    await prisma.advertisementPurchase.deleteMany();
  } catch (error) {
    console.error(error);
  }
}
