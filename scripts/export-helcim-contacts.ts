import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const prisma = new PrismaClient();

const STATE_MAP: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas",
  CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
  WI: "Wisconsin", WY: "Wyoming",
};

const HELCIM_HEADERS = [
  "CUSTOMER_CODE",
  "BUSINESS_NAME",
  "CONTACT_NAME",
  "BILLING_STREET1",
  "BILLING_STREET2",
  "BILLING_CITY",
  "BILLING_PROVINCE",
  "BILLING_COUNTRY",
  "BILLING_POSTALCODE",
  "BILLING_PHONE",
  "BILLING_FAX",
  "BILLING_EMAIL",
  "SHIPPING_STREET1",
  "SHIPPING_STREET2",
  "SHIPPING_CITY",
  "SHIPPING_PROVINCE",
  "SHIPPING_COUNTRY",
  "SHIPPING_POSTALCODE",
  "SHIPPING_PHONE",
  "SHIPPING_FAX",
  "SHIPPING_EMAIL",
  "NOTES",
];

function sanitize(value: string | null | undefined): string {
  if (!value) return "";
  return value.trim().replace(/\s+/g, " ");
}

function escapeCsvField(value: string | null | undefined): string {
  const cleaned = sanitize(value);
  if (!cleaned) return "";
  if (/[",\n\r]/.test(cleaned)) {
    return `"${cleaned.replace(/"/g, '""')}"`;
  }
  return cleaned;
}

async function main() {
  const contacts = await prisma.contact.findMany({
    where: { isDeleted: false },
    select: {
      notes: true,
      contactContactInformation: {
        select: { firstName: true, lastName: true, company: true },
      },
      contactTelecomInformation: {
        select: { phone: true, fax: true, email: true },
      },
      contactAddress: {
        select: {
          address: true,
          address2: true,
          city: true,
          state: true,
          zip: true,
          country: true,
        },
      },
    },
  });

  console.log(`Found ${contacts.length} contacts to export`);

  const rows = contacts.map((contact) => {
    const info = contact.contactContactInformation;
    const telecom = contact.contactTelecomInformation;
    const addr = contact.contactAddress;

    const contactName = [info?.firstName, info?.lastName]
      .map((s) => s?.trim())
      .filter(Boolean)
      .join(" ");

    const province = addr?.state
      ? (STATE_MAP[addr.state] ?? addr.state)
      : "";

    return [
      "",                                 // CUSTOMER_CODE
      escapeCsvField(info?.company),      // BUSINESS_NAME
      escapeCsvField(contactName),        // CONTACT_NAME
      escapeCsvField(addr?.address),      // BILLING_STREET1
      escapeCsvField(addr?.address2),     // BILLING_STREET2
      escapeCsvField(addr?.city),         // BILLING_CITY
      escapeCsvField(province),           // BILLING_PROVINCE
      escapeCsvField(addr?.country),      // BILLING_COUNTRY
      escapeCsvField(addr?.zip),          // BILLING_POSTALCODE
      escapeCsvField(telecom?.phone),     // BILLING_PHONE
      escapeCsvField(telecom?.fax),       // BILLING_FAX
      escapeCsvField(telecom?.email),     // BILLING_EMAIL
      "",                                 // SHIPPING_STREET1
      "",                                 // SHIPPING_STREET2
      "",                                 // SHIPPING_CITY
      "",                                 // SHIPPING_PROVINCE
      "",                                 // SHIPPING_COUNTRY
      "",                                 // SHIPPING_POSTALCODE
      "",                                 // SHIPPING_PHONE
      "",                                 // SHIPPING_FAX
      "",                                 // SHIPPING_EMAIL
      escapeCsvField(contact.notes),      // NOTES
    ].join(",");
  });

  const csv = [HELCIM_HEADERS.join(","), ...rows].join("\n");

  const date = new Date().toISOString().slice(0, 10);
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const outPath = path.resolve(scriptDir, `../helcim-contacts-export-${date}.csv`);

  fs.writeFileSync(outPath, csv, "utf-8");
  console.log(`Exported to ${outPath}`);
}

main()
  .catch((e) => {
    console.error("Export failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
