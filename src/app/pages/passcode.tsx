"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {Card,CardDescription,CardFooter,CardHeader,CardTitle,} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { InputOTP,InputOTPGroup,InputOTPSlot,} from "@/components/ui/input-otp";

import { loginWithPasscode } from "@/services/auth.service";
import { Spinner } from "@/components/ui/spinner";

const formSchema = z.object({
  passcode: z.string().length(6, "Passcode must be exactly 6 digits."),
});

export function Passcode() {
  const navigate = useNavigate();

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

        navigate("/dashboard", {
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
        <Card>
          <form
            id="passcode-form"
            onSubmit={(event) => {
              event.preventDefault();
              form.handleSubmit();
            }}
          >
            <CardHeader>
              <CardTitle>Enter your passcode</CardTitle>

              <CardDescription>
                Six digits, issued with your workspace invite
              </CardDescription>
            </CardHeader>

            <form.Field
              name="passcode"
              children={(field) => (
                <Field className="w-full px-6 py-4">

                  <InputOTP
                    id="passcode"
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    value={field.state.value}
                    onChange={(value) => {
                      field.handleChange(value);
                    }}
                    disabled={loading}
                  >
                    <InputOTPGroup className="flex w-full justify-center">
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </Field>
              )}
            />

            {error && <p className="px-6 pb-2 font-bold text-sm text-destructive">{error}</p>}
 
            <CardFooter className="flex flex-col gap-2">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Spinner className="size-4" />
                    Checking...
                  </>
                ) : (
                  "Log in"
                )}
              </Button>

              <CardDescription className="pt-2 text-center text-[12px] font-light">
                Both routes hit the same authentication API and establish the
                same session.
              </CardDescription>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
