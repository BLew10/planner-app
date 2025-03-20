-- AlterTable
ALTER TABLE "PaymentOverview" ALTER COLUMN "paymentOnLastDay" SET DEFAULT false,
ALTER COLUMN "deliveryMethod" DROP NOT NULL,
ALTER COLUMN "cardType" DROP NOT NULL;
