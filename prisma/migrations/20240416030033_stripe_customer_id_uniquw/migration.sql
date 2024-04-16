/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Contact_stripeCustomerId_key" ON "Contact"("stripeCustomerId");
