import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { handleOAuthCallback, isOAuthProvider } from "@/services/auth.service";

export function Callback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [error, setError] = useState("");

  useEffect(() => {
    const provider = searchParams.get("provider");
    const code = searchParams.get("code");
    const oauthError = searchParams.get("error");

    if (oauthError) {
      setError(
        "Sign-in was cancelled or denied.",
      );
      return;
    }

    if (!isOAuthProvider(provider)) {
      setError(
        "Invalid authentication provider.",
      );
      return;
    }

    if (!code) {
      setError(
        "Authorization code is missing.",
      );
      return;
    }

    const authenticate = async() => {
      try {
        await handleOAuthCallback(
          provider,
          code,
        );

        navigate("/dashboard", {
          replace: true,
        });
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Authentication failed.",
        );
      }
    };

    authenticate();
  }, [searchParams, navigate]);


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
                ? "Google sign-in failed"
                : "Finishing sign-in with Google…"}
            </EmptyTitle>

            <EmptyDescription>
              {error
                ? "We couldn't complete your sign-in."
                : "Please wait while we finish setting up your session."}
            </EmptyDescription>
          </EmptyHeader>

          {error && (
            <Alert variant="destructive">
              <AlertTitle className="font-bold text-text-destructive">
                Failure variant
              </AlertTitle>

              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}
        </Empty>
      </div>
    </div>
  );
}
