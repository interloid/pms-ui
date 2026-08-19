import { TableCell, TableRow } from "@/components/ui/table";

export function EmptyProducts() {
  return (
    <TableRow>
      <TableCell colSpan={8} className="h-100 p-5">
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted p-6 text-center">
          <div
            className="
              mb-1 size-11 rounded-md border bg-background
              bg-[repeating-linear-gradient(
                45deg,
                hsl(var(--background)) 0 5px,
                hsl(var(--muted)) 5px 10px
              )]
            "
          />

          <h3 className="text-[15px] font-semibold">
            No products yet
          </h3>

          <span className="text-[13px] leading-relaxed text-muted-foreground">
            Add your first product to check the create flow end to end —
            fields, image upload, and the new row appearing in the table.
          </span>
          <button></button>
        </div>
      </TableCell>
    </TableRow>
  );
}