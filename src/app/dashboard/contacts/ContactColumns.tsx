import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { ContactTableData } from "@/lib/data/contact";
import DeleteButton from "@/app/(components)/general/DeleteButton";

export const getContactColumns = (
  onContactDelete: (id: string) => void
): ColumnDef<Partial<ContactTableData>>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const contact = row.original;
      const name =
        `${contact.contactContactInformation?.firstName} ${contact.contactContactInformation?.lastName}`.trim();
      return name || "No Name";
    },
  },
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => row.original.contactContactInformation?.company,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => row.original.contactTelecomInformation?.phone,
  },
  {
    accessorKey: "cell",
    header: "Cell",
    cell: ({ row }) => row.original.contactTelecomInformation?.cellPhone,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <Link
        href={`mailto:${row.original.contactTelecomInformation?.email}`}
        className="hover:underline"
      >
        {row.original.contactTelecomInformation?.email}
      </Link>
    ),
  },
  // {
  //   accessorKey: "webAddress",
  //   header: "Web Address",
  //   cell: ({ row }) => (
  //     <a
  //       href={row.original.webAddress || "#"}
  //       target="_blank"
  //       rel="noopener noreferrer"
  //       className="hover:underline"
  //     >
  //       {row.original.webAddress}
  //     </a>
  //   ),
  // },
  // {
  //   accessorKey: "category",
  //   header: "Category",
  //   cell: ({ row }) => {
  //     const category = row.original.category;
  //     return category !== "0" && category
  //       ? CATEGORIES[parseInt(category)].label
  //       : "";
  //   },
  // },
  {
    id: "actions",
    cell: ({ row }) => {
      const contact = row.original;
      return (
        <div className="flex gap-2">
          <Link href={`/dashboard/purchases/add?contactId=${contact.id}`}>
            <Button variant="outline" size="sm">
              Add Purchase
            </Button>
          </Link>

          <Link href={`/dashboard/contacts/${contact.id}/overview`}>
            <Button variant="secondary" size="sm">
              Contact Details
            </Button>
          </Link>
          <Link href={`/dashboard/contacts/${contact.id}`}>
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <DeleteButton
            itemType="Contact"
            itemName={contact.contactContactInformation?.company || ""}
            onDelete={() => onContactDelete(contact.id || "")}
          />
        </div>
      );
    },
  },
];
