import { ContactTableData } from "@/lib/data/contact";

type ContactExportRow = Partial<ContactTableData>;
type CellValue = string | number | null | undefined;

const CONTACT_CSV_COLUMNS: {
  header: string;
  value: (contact: ContactExportRow) => CellValue;
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

const getContactExportRows = (contacts: ContactExportRow[]) => [
  CONTACT_CSV_COLUMNS.map((column) => column.header),
  ...contacts.map((contact) =>
    CONTACT_CSV_COLUMNS.map((column) => formatCellValue(column.value(contact)))
  ),
];

const formatCellValue = (value: CellValue) =>
  value === null || value === undefined
    ? ""
    : String(value).replace(/\r?\n|\r/g, " ");

const escapeCsvCell = (value: CellValue) => {
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
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");

const getColumnName = (index: number) => {
  let columnName = "";
  let columnNumber = index + 1;

  while (columnNumber > 0) {
    const remainder = (columnNumber - 1) % 26;
    columnName = String.fromCharCode(65 + remainder) + columnName;
    columnNumber = Math.floor((columnNumber - 1) / 26);
  }

  return columnName;
};

const createSheetXml = (rows: string[][]) => {
  const columnWidths = CONTACT_CSV_COLUMNS.map((_, columnIndex) => {
    const maxLength = Math.max(
      ...rows.map((row) => row[columnIndex]?.length || 0)
    );
    return Math.min(Math.max(maxLength + 2, 12), 45);
  });
  const cols = `<cols>${columnWidths
    .map(
      (width, index) =>
        `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`
    )
    .join("")}</cols>`;
  const sheetRows = rows
    .map((row, rowIndex) => {
      const rowNumber = rowIndex + 1;
      const cells = row
        .map((cell, columnIndex) => {
          const cellRef = `${getColumnName(columnIndex)}${rowNumber}`;
          return `<c r="${cellRef}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(cell)}</t></is></c>`;
        })
        .join("");

      return `<row r="${rowNumber}">${cells}</row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  ${cols}
  <sheetData>${sheetRows}</sheetData>
</worksheet>`;
};

const XLSX_FILES = {
  "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`,
  "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
  "xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Contacts" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`,
  "xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`,
};

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return crc >>> 0;
});

const getCrc32 = (bytes: Uint8Array) => {
  let crc = 0xffffffff;
  bytes.forEach((byte) => {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  });
  return (crc ^ 0xffffffff) >>> 0;
};

const writeUint16 = (bytes: number[], value: number) => {
  bytes.push(value & 0xff, (value >>> 8) & 0xff);
};

const writeUint32 = (bytes: number[], value: number) => {
  bytes.push(
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff
  );
};

const appendBytes = (target: number[], source: Uint8Array) => {
  source.forEach((byte) => target.push(byte));
};

const createZip = (files: Record<string, string>) => {
  const encoder = new TextEncoder();
  const output: number[] = [];
  const centralDirectory: number[] = [];
  const entries = Object.entries(files);

  entries.forEach(([name, content]) => {
    const nameBytes = encoder.encode(name);
    const contentBytes = encoder.encode(content);
    const crc = getCrc32(contentBytes);
    const localHeaderOffset = output.length;

    writeUint32(output, 0x04034b50);
    writeUint16(output, 20);
    writeUint16(output, 0);
    writeUint16(output, 0);
    writeUint16(output, 0);
    writeUint16(output, 0);
    writeUint32(output, crc);
    writeUint32(output, contentBytes.length);
    writeUint32(output, contentBytes.length);
    writeUint16(output, nameBytes.length);
    writeUint16(output, 0);
    appendBytes(output, nameBytes);
    appendBytes(output, contentBytes);

    writeUint32(centralDirectory, 0x02014b50);
    writeUint16(centralDirectory, 20);
    writeUint16(centralDirectory, 20);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint32(centralDirectory, crc);
    writeUint32(centralDirectory, contentBytes.length);
    writeUint32(centralDirectory, contentBytes.length);
    writeUint16(centralDirectory, nameBytes.length);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint32(centralDirectory, 0);
    writeUint32(centralDirectory, localHeaderOffset);
    appendBytes(centralDirectory, nameBytes);
  });

  const centralDirectoryOffset = output.length;
  output.push(...centralDirectory);

  writeUint32(output, 0x06054b50);
  writeUint16(output, 0);
  writeUint16(output, 0);
  writeUint16(output, entries.length);
  writeUint16(output, entries.length);
  writeUint32(output, centralDirectory.length);
  writeUint32(output, centralDirectoryOffset);
  writeUint16(output, 0);

  return new Uint8Array(output);
};

export const createContactsXlsxBlob = (contacts: ContactExportRow[]) => {
  const rows = getContactExportRows(contacts);
  const xlsxBytes = createZip({
    ...XLSX_FILES,
    "xl/worksheets/sheet1.xml": createSheetXml(rows),
  });

  return new Blob([xlsxBytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};

export const downloadXlsx = (contacts: ContactExportRow[], filename: string) => {
  downloadBlob(createContactsXlsxBlob(contacts), filename);
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
