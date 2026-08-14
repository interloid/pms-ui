import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

export function Callback() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const [error, setError] = useState("");

  useEffect(() => {
    const authenticate = async () => {
      const isAuthenticated = await checkAuth();

      if (isAuthenticated) {
        navigate("/products", {
          replace: true,
        });
      } else {
        setError("We couldn't complete your sign-in.");
      }
    };
    authenticate();
  }, [checkAuth, navigate]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-lg">
        <Empty className="w-full">
          <EmptyHeader>
            <EmptyMedia variant="default">
              {!error && <Spinner className="size-8 text-primary" />}
            </EmptyMedia>

            <EmptyTitle>
              {error
                ? "Sign-in failed"
                : "Finishing sign-in…"}
            </EmptyTitle>

            <EmptyDescription>
              {error
                ? "We couldn't complete your sign-in."
                : "Please wait while we finish setting up your session."}
            </EmptyDescription>
          </EmptyHeader>

          {error && (
            <Alert variant="destructive">
              <AlertTitle className="font-bold">
                Authentication error
              </AlertTitle>

              <AlertDescription className="text-xs">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </Empty>
      </div>
    </div>
  );
}