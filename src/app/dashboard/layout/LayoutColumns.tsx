import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import Link from "next/link";
import DeleteButton from "@/app/(components)/general/DeleteButton";

interface Layout {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export function getLayoutColumns(onDelete: (id: string) => Promise<boolean>): ColumnDef<Layout>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.original.description || "-",
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const layout = row.original;
        return (
          <div className="flex items-center justify-end gap-2 pr-2">
            <Link href={`/dashboard/layout/${layout.id}`}>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <DeleteButton
              itemType="Layout"
              itemName={layout.name}
              onDelete={() => onDelete(layout.id)}
            />
          </div>
        );
      },
    },
  ];
} 