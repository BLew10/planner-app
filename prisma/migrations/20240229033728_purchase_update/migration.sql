-- AlterTable
ALTER TABLE "PurchaseSlot" ADD COLUMN     "purchaseId" TEXT;

-- AddForeignKey
ALTER TABLE "PurchaseSlot" ADD CONSTRAINT "PurchaseSlot_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "PurchaseOverview"("id") ON DELETE SET NULL ON UPDATE CASCADE;
