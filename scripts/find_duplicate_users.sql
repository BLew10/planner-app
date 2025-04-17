-- First, let's see the duplicate emails and their counts
WITH DuplicateEmails AS (
  SELECT 
    cti.email,
    COUNT(*) as contact_count,
    STRING_AGG(c.id::text, ', ') as contact_ids
  FROM "Contact" c
  INNER JOIN "ContactTelecomInformation" cti ON c.id = cti."contactId"
  WHERE c."isDeleted" = false
    AND cti.email IS NOT NULL 
    AND cti.email != ''
  GROUP BY cti.email
  HAVING COUNT(*) > 1
),
ContactsWithActivity AS (
  SELECT DISTINCT c.id
  FROM "Contact" c
  WHERE EXISTS (
    SELECT 1 FROM "PurchaseOverview" po WHERE po."contactId" = c.id
    UNION
    SELECT 1 FROM "Payment" p WHERE p."contactId" = c.id
    UNION
    SELECT 1 FROM "PaymentOverview" pov WHERE pov."contactId" = c.id
  )
),
ActivityDetails AS (
  SELECT 
    c.id as contact_id,
    COUNT(DISTINCT po.id) as purchase_count,
    COUNT(DISTINCT p.id) as payment_count,
    COUNT(DISTINCT pov.id) as payment_overview_count,
    COALESCE(SUM(po."amountOwed"), 0) as total_owed,
    COALESCE(SUM(p.amount), 0) as total_paid
  FROM "Contact" c
  LEFT JOIN "PurchaseOverview" po ON c.id = po."contactId"
  LEFT JOIN "Payment" p ON c.id = p."contactId"
  LEFT JOIN "PaymentOverview" pov ON c.id = pov."contactId"
  GROUP BY c.id
),
RankedContacts AS (
  SELECT 
    c.id as "Contact ID",
    cci.company as "Company",
    cci."firstName" as "First Name",
    cci."lastName" as "Last Name",
    cti.email as "Email",
    cti.phone as "Phone",
    CASE WHEN cwa.id IS NOT NULL THEN 'Yes' ELSE 'No' END as "Has Activity",
    ad.purchase_count as "Purchase Count",
    ad.payment_count as "Payment Count",
    ad.payment_overview_count as "Payment Overview Count",
    ad.total_owed as "Total Owed",
    ad.total_paid as "Total Paid",
    de.contact_count as "Total Duplicates",
    ROW_NUMBER() OVER (
      PARTITION BY cti.email 
      ORDER BY 
        -- Keep contacts with activity
        CASE WHEN cwa.id IS NOT NULL THEN 0 ELSE 1 END,
        -- Prefer contacts with company names
        CASE WHEN cci.company IS NOT NULL AND cci.company != '' THEN 0 ELSE 1 END,
        -- Prefer contacts with names
        CASE WHEN cci."firstName" IS NOT NULL OR cci."lastName" IS NOT NULL THEN 0 ELSE 1 END,
        -- If all else equal, keep the lowest ID (oldest)
        c.id
    ) as rank
  FROM "Contact" c
  INNER JOIN "ContactTelecomInformation" cti ON c.id = cti."contactId"
  LEFT JOIN "ContactContactInformation" cci ON c.id = cci."contactId"
  INNER JOIN DuplicateEmails de ON de.email = cti.email
  LEFT JOIN ContactsWithActivity cwa ON c.id = cwa.id
  LEFT JOIN ActivityDetails ad ON c.id = ad.contact_id
  WHERE c."isDeleted" = false
)
-- Show all duplicates (both rank 1 and higher)
SELECT 
  rc."Contact ID",
  rc."Company",
  rc."First Name",
  rc."Last Name",
  rc."Email",
  rc."Phone",
  rc."Has Activity",
  rc."Purchase Count",
  rc."Payment Count",
  rc."Payment Overview Count",
  rc."Total Owed",
  rc."Total Paid",
  rc."Total Duplicates",
  rc.rank
FROM RankedContacts rc
ORDER BY rc."Email", rc.rank;

-- First show contacts with no telecom information
WITH OrphanedContacts AS (
  SELECT 
    c.id as "Contact ID",
    cci.company as "Company",
    cci."firstName" as "First Name",
    cci."lastName" as "Last Name",
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM "PurchaseOverview" po WHERE po."contactId" = c.id
        UNION
        SELECT 1 FROM "Payment" p WHERE p."contactId" = c.id
        UNION
        SELECT 1 FROM "PaymentOverview" pov WHERE pov."contactId" = c.id
      ) THEN 'Yes' 
      ELSE 'No' 
    END as "Has Activity"
  FROM "Contact" c
  LEFT JOIN "ContactTelecomInformation" cti ON c.id = cti."contactId"
  LEFT JOIN "ContactContactInformation" cci ON c.id = cci."contactId"
  WHERE c."isDeleted" = false
    AND cti.id IS NULL
)
SELECT * FROM OrphanedContacts
ORDER BY "Has Activity", "Company", "First Name", "Last Name";

-- Then run this deletion query (commented out for safety)
/*
BEGIN;

-- Create temporary table to store the IDs we want to delete
CREATE TEMP TABLE contacts_to_delete AS
SELECT c.id
FROM "Contact" c
LEFT JOIN "ContactTelecomInformation" cti ON c.id = cti."contactId"
WHERE c."isDeleted" = false
  AND cti.id IS NULL;

-- Delete all related records using the temporary table
DELETE FROM "AdvertisementPurchaseSlot" 
WHERE "contactId" IN (SELECT id FROM contacts_to_delete);

DELETE FROM "Payment" 
WHERE "contactId" IN (SELECT id FROM contacts_to_delete);

DELETE FROM "PaymentOverview" 
WHERE "contactId" IN (SELECT id FROM contacts_to_delete);

DELETE FROM "PurchaseOverview" 
WHERE "contactId" IN (SELECT id FROM contacts_to_delete);

DELETE FROM "ContactAddressBook" 
WHERE "contactId" IN (SELECT id FROM contacts_to_delete);

DELETE FROM "ContactAddress" 
WHERE "contactId" IN (SELECT id FROM contacts_to_delete);

DELETE FROM "ContactContactInformation" 
WHERE "contactId" IN (SELECT id FROM contacts_to_delete);

-- Finally delete the contacts themselves
DELETE FROM "Contact"
WHERE id IN (SELECT id FROM contacts_to_delete);

-- Clean up
DROP TABLE contacts_to_delete;

COMMIT;
*/ 