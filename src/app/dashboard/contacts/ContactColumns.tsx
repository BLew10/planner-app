import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ContactTableData } from "@/lib/data/contact";
import { CATEGORIES } from "@/lib/constants";
import ActionButtonWithModal from "@/app/(components)/general/ActionButtonWithModal";

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
  {
    accessorKey: "webAddress",
    header: "Web Address",
    cell: ({ row }) => (
      <a
        href={row.original.webAddress || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        {row.original.webAddress}
      </a>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.category;
      return category !== "0" && category
        ? CATEGORIES[parseInt(category)].label
        : "";
    },
  },
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
          <Link href={`/dashboard/contacts/${contact.id}`}>
            <Button variant="edit" size="sm">
              Edit
            </Button>
          </Link>
          <ActionButtonWithModal
            triggerText="Delete"
            modalTitle="Confirm Delete"
            modalText="Are you sure you want to delete this contact? This action cannot be undone."
            actionText="Delete"
            onAction={() => onContactDelete(contact.id || "")}
            variant="destructive"
            size="sm"
          />
        </div>
      );
    },
  },
];
