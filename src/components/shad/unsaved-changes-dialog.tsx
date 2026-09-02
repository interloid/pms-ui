import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKeepEditing: () => void;
  onDiscard: () => void;
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onKeepEditing,
  onDiscard,
}: UnsavedChangesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="size-5 text-amber-600" />
          </div>

          <DialogTitle className="text-base">Unsaved changes</DialogTitle>

          <DialogDescription className="text-sm leading-5">
            You have unsaved changes. If you leave now, your changes will be
            lost.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2 flex-row justify-end gap-2 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            onClick={onKeepEditing}
            className="hover:border-primary hover:bg-primary-hover focus-visible:border-primary focus-visible:ring-primary/20"
          >
            Keep editing
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={onDiscard}
            className="bg-cancel-button-background text-background hover:bg-red-400 focus-visible:border-destructive! focus-visible:ring-destructive/20!"
          >
            Discard changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
