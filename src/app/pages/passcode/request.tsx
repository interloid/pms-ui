import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { requestPasscode } from "@/services/auth-service";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function PasscodeRequestPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setIsLoading(true);

      const response = await requestPasscode(trimmedEmail);

      if (!response.success) {
        toast.error(response.message);
        return;
      }
      toast.success("Passcode sent successfully");

      navigate("/passcode/verify", {
        state: {
          email: trimmedEmail,
        },
      });
    } catch (error) {
      console.error("Passcode request error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send passcode",
      );
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
                Get your passcode
              </CardTitle>
              <CardDescription>
                Enter your email address to receive your six-digit passcode.
              </CardDescription>
            </CardHeader>
            <Field className="w-full px-1 py-4">
              <FieldLabel htmlFor="email">Email address</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="h-10 focus-visible:border-primary focus-visible:primary-3 focus-visible:ring-primary/20"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />

              <FieldDescription>
                We'll send a six-digit passcode to this email address.
              </FieldDescription>
            </Field>

            <CardFooter className="flex w-full flex-col gap-2 px-2">
              <Button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="h-10 w-full"
              >
                {isLoading ? (
                  <>
                    <Spinner className="size-4" />
                    Sending...
                  </>
                ) : (
                  "Send Passcode"
                )}
              </Button>
              <CardDescription className="px-1 pt-2 text-center text-xs text-muted-foreground">
                You will be redirected to the verification page after requesting
                the passcode.
              </CardDescription>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
