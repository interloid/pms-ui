import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { loginWithProvider } from "@/services/auth.service";
import { useAuth } from "@/hooks/useAuth";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import MicrosoftLogo  from "@/components/icons/logos-microsoft-icon";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [providerLoading, setProviderLoading] = useState<string | null>(null);
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login({
        email,
        password,
      });

      const from =
        (
          location.state as
            | { from?: { pathname?: string } }
            | null
        )?.from?.pathname ?? "/products";

      navigate(from, {
        replace: true,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleProviderLogin = async (
    provider: "google" | "github" | "microsoft",
  ) => {
    try {
      setProviderLoading(provider);
      loginWithProvider(provider);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Authentication failed",
      );
    } finally {
      setProviderLoading(null);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-lg">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card className="gap-4 px-2 py-8">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Sign in</CardTitle>
              <CardDescription className="text-muted-text">
                Use your workspace account, or a provider.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <FieldGroup className="gap-4">
                  <Field className="flex-col h-fit py-1 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 text-xs"
                      disabled={providerLoading !== null}
                      onClick={() => handleProviderLogin("google")}
                    >
                      {providerLoading === "google" ? (
                        <>
                          <Spinner className="size-4" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <FcGoogle />
                          <span>Continue with Google</span>
                        </>
                      )}
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 flex-1 text-xs"
                        onClick={() => handleProviderLogin("github")}
                      >
                        <FaGithub className="size-4" />
                        GitHub
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 flex-1 text-xs"
                        onClick={() => handleProviderLogin("microsoft")}
                      >
                        <MicrosoftLogo />
                        Microsoft
                      </Button>
                    </div>
                  </Field>
                  <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card text-xs py-1">
                    OR
                  </FieldSeparator>
                  <Field className="gap-1">
                    <FieldLabel htmlFor="email" className="text-xs font-medium">
                      Username or email
                    </FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder=""
                      value={email}
                      autoComplete="username"
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      className="h-10 focus-visible:border-primary focus-visible:primary-3 focus-visible:ring-primary/20"
                    />
                  </Field>
                  <Field className="gap-1">
                    <div className="flex items-center">
                      <FieldLabel
                        htmlFor="password"
                        className="text-xs font-medium"
                      >
                        Password
                      </FieldLabel>
                      <a
                        href="#"
                        className="ml-auto text-xs underline-offset-4 hover:underline text-primary"
                      >
                        Forgot?
                      </a>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                        required
                        className="h-10 focus-visible:border-primary focus-visible:primary-3 focus-visible:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        <span className="text-xs font-medium">
                          {showPassword ? "Hide" : "Show"}
                        </span>
                      </button>
                    </div>
                  </Field>
                  <div className="flex items-center gap-2">
                    <Checkbox />
                    <label
                      htmlFor="remember-me"
                      className="text-xs font-normal text-muted-text leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Keep me signed in on this device
                    </label>
                  </div>
                  <Field>
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-10 text-sm"
                    >
                      {loading ? (
                        <>
                          <Spinner className="size-4" />
                          Checking...
                        </>
                      ) : (
                        "Log in"
                      )}
                    </Button>

                    <FieldDescription className="text-center text-xs">
                      Have a passcode instead?{" "}
                      <a
                        href="/passcode"
                        className="text-primary font-semibold no-underline! hover:underline!"
                      >
                        Use passcode
                      </a>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
