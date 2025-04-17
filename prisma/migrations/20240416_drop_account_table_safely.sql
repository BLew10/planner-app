-- DropForeignKey
ALTER TABLE IF EXISTS "Account" DROP CONSTRAINT IF EXISTS "Account_userId_fkey";

-- DropTable
DROP TABLE IF EXISTS "Account";

-- Note: All other tables and data are preserved 