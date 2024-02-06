/*
  Warnings:

  - You are about to drop the column `contactContactInformationId` on the `Contact` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "contactContactInformationId";

-- AlterTable
ALTER TABLE "ContactAddress" ADD COLUMN     "address2" TEXT;
