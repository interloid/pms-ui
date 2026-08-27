import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { PasscodeLocationState } from "@/types/auth";

const OTP_LENGTH = 6;

export default function PasscodeVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithPasscode } = useAuth();
  const state = location.state as PasscodeLocationState | null;
  const email = state?.email;
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      navigate("/passcode", {
        replace: true,
      });
      return;
    }

    if (passcode.length !== OTP_LENGTH) {
      return;
    }

    try {
      setIsLoading(true);
      await loginWithPasscode(email, passcode);

      navigate("/products", {
        replace: true,
      });
    } catch (error) {
      console.error("Passcode verification failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-full w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-lg">
        <Card className="w-full p-8">
          <Tabs defaultValue="Passcode" className="w-full">
            <TabsList className="h-10! w-full">
              <TabsTrigger
                value="Username"
                className="h-8! flex-1 text-xs"
                onClick={() => navigate("/login")}
              >
                Username
              </TabsTrigger>

              <TabsTrigger value="Passcode" className="h-8! flex-1 text-xs">
                Passcode
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="w-full" noValidate>
            <CardHeader className="px-1">
              <CardTitle className="text-lg font-bold">
                Enter your passcode
              </CardTitle>

              <CardDescription>
                Six digits, issued with your workspace invite
              </CardDescription>

              {email && (
                <CardDescription>
                  Enter the passcode sent to{" "}
                  <span className="font-medium">{email}</span>
                </CardDescription>
              )}
            </CardHeader>

            <Field className="w-full px-1 py-4">
              <InputOTP
                id="passcode"
                maxLength={OTP_LENGTH}
                value={passcode}
                onChange={setPasscode}
                disabled={isLoading}
                inputMode="numeric"
                autoFocus
                className="h-10 focus-visible:border-primary focus-visible:primary-3 focus-visible:ring-primary/20"
              >
                <InputOTPGroup className="flex w-full justify-center text-sm font-bold">
                  {Array.from({
                    length: OTP_LENGTH,
                  }).map((_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="w-full data-[active=true]:border-primary data-[active=true]:ring-2 data-[active=true]:ring-primary/20"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </Field>

            <CardFooter className="flex w-full flex-col gap-2 px-2">
              <Button
                type="submit"
                disabled={isLoading || passcode.length !== OTP_LENGTH}
                className="h-10 w-full"
              >
                {isLoading ? (
                  <>
                    <Spinner className="size-4" />
                    Checking...
                  </>
                ) : (
                  "Log in"
                )}
              </Button>

              <CardDescription className="px-1 pt-2 text-center text-xs text-muted-foreground">
                Enter the 6-digit passcode sent to your email.
              </CardDescription>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
