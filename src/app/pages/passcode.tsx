"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  passcode: z.string().length(6, "Passcode must be exactly 6 digits."),
});

export function Passcode() {
  const navigate = useNavigate();
  const { loginWithPasscode } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm({
    defaultValues: {
      passcode: "",
    },

    validators: {
      onSubmit: formSchema,
    },

    onSubmit: async ({ value }) => {
      setError("");
      setLoading(true);

      try {
        await loginWithPasscode(value.passcode);

        navigate("/products", {
          replace: true,
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : "Invalid passcode");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-lg">
        <Card className="w-full p-8">
          <Tabs defaultValue="Passcode" className="w-full">
            <TabsList className="h-10! w-full">
              <TabsTrigger value="Username" className="h-8! flex-1 text-xs" onClick={() => navigate("/login")}>
                Username
              </TabsTrigger>

              <TabsTrigger value="Passcode" className="h-8! flex-1 text-xs">
                Passcode
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <form
            id="passcode-form"
            onSubmit={(event) => {
              event.preventDefault();
              form.handleSubmit();
            }}
          >
            {" "}
            <CardHeader className="px-1">
              <CardTitle className="text-lg font-bold">
                Enter your passcode
              </CardTitle>

              <CardDescription>
                Six digits, issued with your workspace invite
              </CardDescription>
            </CardHeader>
            <form.Field
              name="passcode"
              children={(field) => (
                <Field className="w-full px-1 py-4">
                  <InputOTP
                    id="passcode"
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    value={field.state.value}
                    onChange={(value) => {
                      field.handleChange(value);
                    }}
                    disabled={loading}
                    className="w-full"
                  >
                    <InputOTPGroup className="flex w-full justify-center text-sm font-bold ">
                      <InputOTPSlot
                        index={0}
                       className="w-full data-[active=true]:border-primary data-[active=true]:ring-2 data-[active=true]:ring-primary/20"
                      />
                      <InputOTPSlot
                        index={1}
                        className="w-full data-[active=true]:border-primary data-[active=true]:ring-2 data-[active=true]:ring-primary/20"
                      />
                      <InputOTPSlot
                        index={2}
                        className="w-full data-[active=true]:border-primary data-[active=true]:ring-2 data-[active=true]:ring-primary/20"
                      />
                      <InputOTPSlot
                        index={3}
                        className="w-full data-[active=true]:border-primary data-[active=true]:ring-2 data-[active=true]:ring-primary/20"
                      />
                      <InputOTPSlot
                        index={4}
                        className="w-full data-[active=true]:border-primary data-[active=true]:ring-2 data-[active=true]:ring-primary/20"
                      />
                      <InputOTPSlot
                        index={5}
                        className="w-full data-[active=true]:border-primary data-[active=true]:ring-2 data-[active=true]:ring-primary/20"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </Field>
              )}
            />
            {error && (
              <p className="px-6 pb-2 font-bold text-sm text-destructive">
                {error}
              </p>
            )}
            <CardFooter className="flex flex-col gap-2 w-full px-2">
              <Button type="submit" disabled={loading} className="w-full h-10">
                {loading ? (
                  <>
                    <Spinner className="size-4" />
                    Checking...
                  </>
                ) : (
                  "Log in"
                )}
              </Button>

              <CardDescription className="pt-2 text-center text-xs px-1 text-muted-text">
                Both routes hit POST /api/auth/login and set the same session
                cookie.
              </CardDescription>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
