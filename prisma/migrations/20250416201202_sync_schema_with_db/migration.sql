-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddressBook" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayLevel" TEXT,
    "userId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AddressBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advertisement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDayType" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "perMonth" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Advertisement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvertisementPurchase" (
    "id" TEXT NOT NULL,
    "advertisementId" TEXT NOT NULL,
    "charge" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "purchaseId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "calendarId" TEXT NOT NULL,

    CONSTRAINT "AdvertisementPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvertisementPurchaseSlot" (
    "id" TEXT NOT NULL,
    "advertisementPurchaseId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,
    "date" TEXT,
    "purchaseId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "calendarId" TEXT NOT NULL,
    "calendarEditionYear" INTEGER NOT NULL,
    "advertisementId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,

    CONSTRAINT "AdvertisementPurchaseSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEdition" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "code" TEXT,

    CONSTRAINT "CalendarEdition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "customerSince" TEXT,
    "notes" TEXT,
    "webAddress" TEXT,
    "category" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactAddress" (
    "id" TEXT NOT NULL,
    "address" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT,
    "contactId" TEXT,

    CONSTRAINT "ContactAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactAddressBook" (
    "contactId" TEXT NOT NULL,
    "addressBookId" TEXT NOT NULL,

    CONSTRAINT "ContactAddressBook_pkey" PRIMARY KEY ("contactId","addressBookId")
);

-- CreateTable
CREATE TABLE "ContactContactInformation" (
    "id" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "altContactFirstName" TEXT,
    "altContactLastName" TEXT,
    "salutation" TEXT,
    "company" TEXT,
    "contactId" TEXT NOT NULL,

    CONSTRAINT "ContactContactInformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactTelecomInformation" (
    "id" TEXT NOT NULL,
    "extension" TEXT,
    "phone" TEXT,
    "altPhone" TEXT,
    "fax" TEXT,
    "email" TEXT,
    "cellPhone" TEXT,
    "homePhone" TEXT,
    "contactId" TEXT,

    CONSTRAINT "ContactTelecomInformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "date" TEXT NOT NULL,
    "isYearly" BOOLEAN NOT NULL DEFAULT true,
    "year" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isMultiDay" BOOLEAN NOT NULL DEFAULT false,
    "endDate" TEXT,
    "startTime" TEXT,
    "endTime" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "paymentDate" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "checkNumber" TEXT,
    "paymentMethod" TEXT,
    "contactId" TEXT NOT NULL,
    "paymentOverviewId" TEXT NOT NULL,
    "wasPrepaid" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "cardType" TEXT,
    "cardNumber" TEXT,
    "cardExpiration" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAllocation" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "scheduledPaymentId" TEXT NOT NULL,
    "allocatedAmount" DECIMAL(65,30) NOT NULL,
    "paymentOverviewId" TEXT NOT NULL,

    CONSTRAINT "PaymentAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentOverview" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "contactId" TEXT,
    "totalSale" DECIMAL(65,30) NOT NULL,
    "additionalDiscount1" DECIMAL(65,30),
    "additionalDiscount2" DECIMAL(65,30),
    "additionalSales1" DECIMAL(65,30),
    "additionalSales2" DECIMAL(65,30),
    "trade" DECIMAL(65,30),
    "earlyPaymentDiscount" DECIMAL(65,30),
    "earlyPaymentDiscountPercent" DECIMAL(65,30),
    "paymentDueOn" INTEGER,
    "paymentOnLastDay" BOOLEAN NOT NULL DEFAULT false,
    "lateFee" DECIMAL(65,30),
    "lateFeePercent" DECIMAL(65,30),
    "deliveryMethod" TEXT,
    "invoiceMessage" TEXT,
    "statementMessage" TEXT,
    "purchaseId" TEXT,
    "splitPaymentsEqually" BOOLEAN NOT NULL DEFAULT false,
    "amountPaid" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "net" DECIMAL(65,30) NOT NULL,
    "calendarEditionYear" INTEGER NOT NULL,
    "prepaid" BOOLEAN NOT NULL DEFAULT false,
    "lastPaymentId" TEXT,
    "invoiceNumber" TEXT NOT NULL,
    "cardExpiration" TEXT,

    CONSTRAINT "PaymentOverview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOverview" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "calendarEditionYear" INTEGER NOT NULL,
    "amountOwed" DECIMAL(65,30) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentOverviewId" TEXT,

    CONSTRAINT "PurchaseOverview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledPayment" (
    "id" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "paymentOverviewId" TEXT NOT NULL,
    "isLate" BOOLEAN NOT NULL DEFAULT false,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paymentDate" TEXT,
    "amountPaid" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lateFeeWaived" BOOLEAN NOT NULL DEFAULT false,
    "lateFeeAddedToNet" BOOLEAN NOT NULL DEFAULT false,
    "lateFee" DECIMAL(65,30),
    "dueDateTimeStamp" DATE,

    CONSTRAINT "ScheduledPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "billingUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CalendarEditionToEvent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CalendarEditionToPurchaseOverview" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ContactAddressBooks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider" ASC, "providerAccountId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEdition_code_key" ON "CalendarEdition"("code" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ContactAddress_contactId_key" ON "ContactAddress"("contactId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ContactContactInformation_contactId_key" ON "ContactContactInformation"("contactId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ContactTelecomInformation_contactId_key" ON "ContactTelecomInformation"("contactId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAllocation_paymentId_scheduledPaymentId_key" ON "PaymentAllocation"("paymentId" ASC, "scheduledPaymentId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentOverview_invoiceNumber_key" ON "PaymentOverview"("invoiceNumber" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentOverview_lastPaymentId_key" ON "PaymentOverview"("lastPaymentId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentOverview_purchaseId_key" ON "PaymentOverview"("purchaseId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOverview_paymentOverviewId_key" ON "PurchaseOverview"("paymentOverviewId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOverview_year_contactId_key" ON "PurchaseOverview"("calendarEditionYear" ASC, "contactId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "_CalendarEditionToEvent_AB_unique" ON "_CalendarEditionToEvent"("A" ASC, "B" ASC);

-- CreateIndex
CREATE INDEX "_CalendarEditionToEvent_B_index" ON "_CalendarEditionToEvent"("B" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "_CalendarEditionToPurchaseOverview_AB_unique" ON "_CalendarEditionToPurchaseOverview"("A" ASC, "B" ASC);

-- CreateIndex
CREATE INDEX "_CalendarEditionToPurchaseOverview_B_index" ON "_CalendarEditionToPurchaseOverview"("B" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "_ContactAddressBooks_AB_unique" ON "_ContactAddressBooks"("A" ASC, "B" ASC);

-- CreateIndex
CREATE INDEX "_ContactAddressBooks_B_index" ON "_ContactAddressBooks"("B" ASC);

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddressBook" ADD CONSTRAINT "AddressBook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchase" ADD CONSTRAINT "AdvertisementPurchase_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "Advertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchase" ADD CONSTRAINT "AdvertisementPurchase_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "CalendarEdition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchase" ADD CONSTRAINT "AdvertisementPurchase_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "PurchaseOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchaseSlot" ADD CONSTRAINT "AdvertisementPurchaseSlot_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "Advertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchaseSlot" ADD CONSTRAINT "AdvertisementPurchaseSlot_advertisementPurchaseId_fkey" FOREIGN KEY ("advertisementPurchaseId") REFERENCES "AdvertisementPurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchaseSlot" ADD CONSTRAINT "AdvertisementPurchaseSlot_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "CalendarEdition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchaseSlot" ADD CONSTRAINT "AdvertisementPurchaseSlot_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchaseSlot" ADD CONSTRAINT "AdvertisementPurchaseSlot_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "PurchaseOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEdition" ADD CONSTRAINT "CalendarEdition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactAddress" ADD CONSTRAINT "ContactAddress_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactAddressBook" ADD CONSTRAINT "ContactAddressBook_addressBookId_fkey" FOREIGN KEY ("addressBookId") REFERENCES "AddressBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactAddressBook" ADD CONSTRAINT "ContactAddressBook_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactContactInformation" ADD CONSTRAINT "ContactContactInformation_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactTelecomInformation" ADD CONSTRAINT "ContactTelecomInformation_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentOverviewId_fkey" FOREIGN KEY ("paymentOverviewId") REFERENCES "PaymentOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "PurchaseOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_paymentOverviewId_fkey" FOREIGN KEY ("paymentOverviewId") REFERENCES "PaymentOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_scheduledPaymentId_fkey" FOREIGN KEY ("scheduledPaymentId") REFERENCES "ScheduledPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentOverview" ADD CONSTRAINT "PaymentOverview_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentOverview" ADD CONSTRAINT "PaymentOverview_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "PurchaseOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentOverview" ADD CONSTRAINT "PaymentOverview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOverview" ADD CONSTRAINT "PurchaseOverview_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOverview" ADD CONSTRAINT "PurchaseOverview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledPayment" ADD CONSTRAINT "ScheduledPayment_paymentOverviewId_fkey" FOREIGN KEY ("paymentOverviewId") REFERENCES "PaymentOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CalendarEditionToEvent" ADD CONSTRAINT "CalendarEdition_fkey" FOREIGN KEY ("A") REFERENCES "CalendarEdition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CalendarEditionToEvent" ADD CONSTRAINT "Event_fkey" FOREIGN KEY ("B") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CalendarEditionToPurchaseOverview" ADD CONSTRAINT "_CalendarEditionToPurchaseOverview_A_fkey" FOREIGN KEY ("A") REFERENCES "CalendarEdition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CalendarEditionToPurchaseOverview" ADD CONSTRAINT "_CalendarEditionToPurchaseOverview_B_fkey" FOREIGN KEY ("B") REFERENCES "PurchaseOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactAddressBooks" ADD CONSTRAINT "_ContactAddressBooks_A_fkey" FOREIGN KEY ("A") REFERENCES "AddressBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactAddressBooks" ADD CONSTRAINT "_ContactAddressBooks_B_fkey" FOREIGN KEY ("B") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

