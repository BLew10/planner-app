-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEdition" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "CalendarEdition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Month" (
    "monthId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "editionId" INTEGER NOT NULL,

    CONSTRAINT "Month_pkey" PRIMARY KEY ("monthId")
);

-- CreateTable
CREATE TABLE "Display" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "isOccupied" BOOLEAN NOT NULL DEFAULT false,
    "monthId" INTEGER NOT NULL,
    "clientId" INTEGER,

    CONSTRAINT "Display_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddressBook" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "displayLevel" TEXT,
    "clientId" INTEGER,

    CONSTRAINT "AddressBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ClientAddressBooks" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Month_monthId_year_key" ON "Month"("monthId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "_ClientAddressBooks_AB_unique" ON "_ClientAddressBooks"("A", "B");

-- CreateIndex
CREATE INDEX "_ClientAddressBooks_B_index" ON "_ClientAddressBooks"("B");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEdition" ADD CONSTRAINT "CalendarEdition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Month" ADD CONSTRAINT "Month_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "CalendarEdition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Display" ADD CONSTRAINT "Display_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "Month"("monthId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Display" ADD CONSTRAINT "Display_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClientAddressBooks" ADD CONSTRAINT "_ClientAddressBooks_A_fkey" FOREIGN KEY ("A") REFERENCES "AddressBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClientAddressBooks" ADD CONSTRAINT "_ClientAddressBooks_B_fkey" FOREIGN KEY ("B") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
