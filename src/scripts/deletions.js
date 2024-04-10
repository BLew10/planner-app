const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function deletePurchases() {
  try {
    await prisma.purchaseSlot.deleteMany();
    await prisma.advertisementPurchase.deleteMany();
    await prisma.purchaseOverview.deleteMany();
    await prisma.stripeInvoice.deleteMany();
    await prisma.payment.deleteMany();
    
  } catch (error) {
    console.error(error);
  }
}


async function deleteContacts() {
  
  try {
    await prisma.contact.deleteMany();
  } catch (error) {
    console.error(error);
  }
}

// c
// async function deleteAddressBooks() {
  
// }
deletePurchases()