import { PrismaClient } from "@prisma/client";
import * as dotenv from 'dotenv';
dotenv.config(); // This loads environment variables from .env file

const prisma = new PrismaClient();

async function populateDueDateTimestamps() {
  try {
    // Get all scheduled payments
    const payments = await prisma.scheduledPayment.findMany();
    console.log(`Found ${payments.length} payments to update`);

    // Process in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < payments.length; i += batchSize) {
      const batch = payments.slice(i, i + batchSize);
      console.log(
        `Processing batch ${i / batchSize + 1} of ${Math.ceil(
          payments.length / batchSize
        )}`
      );

      await Promise.all(
        batch.map(async (payment) => {
          // Parse MM-DD-YYYY string
          const [month, day, year] = payment.dueDate.split("-").map(Number);

          // Create date at NOON to avoid any timezone offset issues
          // This ensures the date won't shift to a different day in any timezone
          const timestamp = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

          // Update the record
          await prisma.scheduledPayment.update({
            where: { id: payment.id },
            data: { dueDateTimeStamp: timestamp },
          });
        })
      );
    }

    console.log("Successfully populated dueDateTimestamp fields");
  } catch (error) {
    console.error("Error populating dueDateTimestamp fields:", error);
  } finally {
    await prisma.$disconnect();
  }
}

populateDueDateTimestamps()
  .then(() => console.log("Migration complete"))
  .catch(console.error);
