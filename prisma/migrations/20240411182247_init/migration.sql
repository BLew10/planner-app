-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "CalendarEdition" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CalendarEdition_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "AddressBook" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayLevel" TEXT,
    "userId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AddressBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactAddressBook" (
    "contactId" TEXT NOT NULL,
    "addressBookId" TEXT NOT NULL,

    CONSTRAINT "ContactAddressBook_pkey" PRIMARY KEY ("contactId","addressBookId")
);

-- CreateTable
CREATE TABLE "PurchaseOverview" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "editionId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "amountOwed" DECIMAL(65,30) NOT NULL,
    "paymentId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PurchaseOverview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "totalOwed" DECIMAL(65,30) NOT NULL,
    "totalPaid" DECIMAL(65,30) NOT NULL,
    "frequency" TEXT NOT NULL,
    "totalPayments" INTEGER NOT NULL,
    "startDate" TEXT NOT NULL,
    "anticipatedEndDate" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "paymentsMade" INTEGER NOT NULL DEFAULT 0,
    "contactId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "stripeScheduleId" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentInvoice" (
    "id" TEXT NOT NULL,
    "stripeInvoiceId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "stripeScheduleId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "amountOwed" DECIMAL(65,30) NOT NULL,
    "datePaid" TEXT,
    "dateSent" TEXT,
    "dateDue" TEXT,
    "invoiceLink" TEXT,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PaymentInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvertisementPurchase" (
    "id" TEXT NOT NULL,
    "advertisementId" TEXT NOT NULL,
    "charge" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "purchaseId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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

    CONSTRAINT "AdvertisementPurchaseSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ContactAddressBooks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactContactInformation_contactId_key" ON "ContactContactInformation"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactTelecomInformation_contactId_key" ON "ContactTelecomInformation"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactAddress_contactId_key" ON "ContactAddress"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentInvoice_stripeInvoiceId_key" ON "PaymentInvoice"("stripeInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentInvoice_stripeScheduleId_key" ON "PaymentInvoice"("stripeScheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "AdvertisementPurchaseSlot_advertisementPurchaseId_month_slo_key" ON "AdvertisementPurchaseSlot"("advertisementPurchaseId", "month", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "_ContactAddressBooks_AB_unique" ON "_ContactAddressBooks"("A", "B");

-- CreateIndex
CREATE INDEX "_ContactAddressBooks_B_index" ON "_ContactAddressBooks"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "PurchaseOverview" ADD CONSTRAINT "PurchaseOverview_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentInvoice" ADD CONSTRAINT "PaymentInvoice_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchase" ADD CONSTRAINT "AdvertisementPurchase_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "Advertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchase" ADD CONSTRAINT "AdvertisementPurchase_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "PurchaseOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchaseSlot" ADD CONSTRAINT "AdvertisementPurchaseSlot_advertisementPurchaseId_fkey" FOREIGN KEY ("advertisementPurchaseId") REFERENCES "AdvertisementPurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchaseSlot" ADD CONSTRAINT "AdvertisementPurchaseSlot_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "PurchaseOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactAddressBooks" ADD CONSTRAINT "_ContactAddressBooks_A_fkey" FOREIGN KEY ("A") REFERENCES "AddressBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactAddressBooks" ADD CONSTRAINT "_ContactAddressBooks_B_fkey" FOREIGN KEY ("B") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
