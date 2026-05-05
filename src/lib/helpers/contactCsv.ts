import { ContactTableData } from "@/lib/data/contact";

type ContactExportRow = Partial<ContactTableData>;

const CONTACT_CSV_COLUMNS: {
  header: string;
  value: (contact: ContactExportRow) => string | number | null | undefined;
}[] = [
  { header: "Company", value: (contact) => contact.contactContactInformation?.company },
  { header: "First Name", value: (contact) => contact.contactContactInformation?.firstName },
  { header: "Last Name", value: (contact) => contact.contactContactInformation?.lastName },
  { header: "Alt Contact First Name", value: (contact) => contact.contactContactInformation?.altContactFirstName },
  { header: "Alt Contact Last Name", value: (contact) => contact.contactContactInformation?.altContactLastName },
  { header: "Salutation", value: (contact) => contact.contactContactInformation?.salutation },
  { header: "Email", value: (contact) => contact.contactTelecomInformation?.email },
  { header: "Phone", value: (contact) => contact.contactTelecomInformation?.phone },
  { header: "Extension", value: (contact) => contact.contactTelecomInformation?.extension },
  { header: "Alt Phone", value: (contact) => contact.contactTelecomInformation?.altPhone },
  { header: "Cell Phone", value: (contact) => contact.contactTelecomInformation?.cellPhone },
  { header: "Home Phone", value: (contact) => contact.contactTelecomInformation?.homePhone },
  { header: "Fax", value: (contact) => contact.contactTelecomInformation?.fax },
  { header: "Address", value: (contact) => contact.contactAddress?.address },
  { header: "Address 2", value: (contact) => contact.contactAddress?.address2 },
  { header: "City", value: (contact) => contact.contactAddress?.city },
  { header: "State", value: (contact) => contact.contactAddress?.state },
  { header: "Zip", value: (contact) => contact.contactAddress?.zip },
  { header: "Country", value: (contact) => contact.contactAddress?.country },
  { header: "Customer Since", value: (contact) => contact.customerSince },
  { header: "Category", value: (contact) => contact.category },
  { header: "Web Address", value: (contact) => contact.webAddress },
  { header: "Notes", value: (contact) => contact.notes },
];

const escapeCsvCell = (value: string | number | null | undefined) => {
  const cell = value === null || value === undefined ? "" : String(value);
  return `"${cell.replace(/"/g, '""')}"`;
};

export const createContactsCsv = (contacts: ContactExportRow[]) => {
  const header = CONTACT_CSV_COLUMNS.map((column) => escapeCsvCell(column.header)).join(",");
  const rows = contacts.map((contact) =>
    CONTACT_CSV_COLUMNS.map((column) => escapeCsvCell(column.value(contact))).join(",")
  );

  return [header, ...rows].join("\r\n");
};

export const downloadCsv = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
