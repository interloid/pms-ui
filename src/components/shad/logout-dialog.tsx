import { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";

interface LogoutDialogProps {
  trigger: React.ReactNode;
}

export function LogoutDialog({ trigger }: LogoutDialogProps) {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to log out",
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[16px]">
            Are you sure you want to log out?
          </DialogTitle>

          <DialogDescription>
            You will be signed out of your account and redirected to the login
            page.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={isLoggingOut}
              className="cursor-pointer"
            >
              Cancel
            </Button>
          </DialogClose>

          <Button
            variant="destructive"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="cursor-pointer bg-cancel-button-background text-secondary hover:bg-destructive"
          >
            {isLoggingOut && <Spinner className="mr-2 size-4" />}
            {isLoggingOut ? "Logging out..." : "Log out"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}