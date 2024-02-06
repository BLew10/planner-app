/*
  Warnings:

  - A unique constraint covering the columns `[contactId]` on the table `ContactAddress` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contactId]` on the table `ContactTelecomInformation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ContactAddress_contactId_key" ON "ContactAddress"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactTelecomInformation_contactId_key" ON "ContactTelecomInformation"("contactId");
