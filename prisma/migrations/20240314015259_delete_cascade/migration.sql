-- DropForeignKey
ALTER TABLE "AddressBook" DROP CONSTRAINT "AddressBook_userId_fkey";

-- DropForeignKey
ALTER TABLE "Advertisement" DROP CONSTRAINT "Advertisement_userId_fkey";

-- DropForeignKey
ALTER TABLE "AdvertisementPurchase" DROP CONSTRAINT "AdvertisementPurchase_advertisementId_fkey";

-- DropForeignKey
ALTER TABLE "AdvertisementPurchase" DROP CONSTRAINT "AdvertisementPurchase_purchaseId_fkey";

-- DropForeignKey
ALTER TABLE "CalendarEdition" DROP CONSTRAINT "CalendarEdition_userId_fkey";

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_userId_fkey";

-- DropForeignKey
ALTER TABLE "ContactAddress" DROP CONSTRAINT "ContactAddress_contactId_fkey";

-- DropForeignKey
ALTER TABLE "ContactContactInformation" DROP CONSTRAINT "ContactContactInformation_contactId_fkey";

-- DropForeignKey
ALTER TABLE "ContactTelecomInformation" DROP CONSTRAINT "ContactTelecomInformation_contactId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOverview" DROP CONSTRAINT "PurchaseOverview_contactId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOverview" DROP CONSTRAINT "PurchaseOverview_userId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseSlot" DROP CONSTRAINT "PurchaseSlot_advertisementPurchaseId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseSlot" DROP CONSTRAINT "PurchaseSlot_purchaseId_fkey";

-- AlterTable
ALTER TABLE "CalendarEdition" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ContactAddressBook" (
    "contactId" TEXT NOT NULL,
    "addressBookId" TEXT NOT NULL,

    CONSTRAINT "ContactAddressBook_pkey" PRIMARY KEY ("contactId","addressBookId")
);

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactContactInformation" ADD CONSTRAINT "ContactContactInformation_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactTelecomInformation" ADD CONSTRAINT "ContactTelecomInformation_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactAddress" ADD CONSTRAINT "ContactAddress_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEdition" ADD CONSTRAINT "CalendarEdition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddressBook" ADD CONSTRAINT "AddressBook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactAddressBook" ADD CONSTRAINT "ContactAddressBook_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactAddressBook" ADD CONSTRAINT "ContactAddressBook_addressBookId_fkey" FOREIGN KEY ("addressBookId") REFERENCES "AddressBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOverview" ADD CONSTRAINT "PurchaseOverview_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOverview" ADD CONSTRAINT "PurchaseOverview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOverview" ADD CONSTRAINT "PurchaseOverview_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "CalendarEdition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchase" ADD CONSTRAINT "AdvertisementPurchase_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "Advertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchase" ADD CONSTRAINT "AdvertisementPurchase_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "PurchaseOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseSlot" ADD CONSTRAINT "PurchaseSlot_advertisementPurchaseId_fkey" FOREIGN KEY ("advertisementPurchaseId") REFERENCES "AdvertisementPurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseSlot" ADD CONSTRAINT "PurchaseSlot_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "PurchaseOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
