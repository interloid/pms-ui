import { PackageOpen } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";

export  function EmptyProducts() {
  return (
    <TableRow>
      <TableCell colSpan={8} className="h-100 p-5">
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted p-6 text-center">
          <div className="mb-1 flex size-11 items-center justify-center rounded-md border bg-background">
            <PackageOpen className="size-5 text-muted-foreground" />
          </div>
          <h3 className="text-[15px] font-semibold">No products yet</h3>
          <span className="max-w-md text-[13px] leading-relaxed text-muted-foreground">
            Add your first product to check the create flow end to end — fields,
            image upload, and the new row appearing in the table.
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
}
