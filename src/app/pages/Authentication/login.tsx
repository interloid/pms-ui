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
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { loginWithProvider } from "@/services/auth-service";
import { useAuth } from "@/hooks/useAuth";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import MicrosoftLogo from "@/components/icons/microsoft-logo";
import { Eye, EyeOff } from "lucide-react";
import { isAuthError, type OAuthProvider } from "@/types/auth";
import interloidLogo from "@/assets/interloid-logo.png";

export default function LoginPage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [providerLoading, setProviderLoading] = useState<string | null>(null);

  const validateForm = () => {
    if (!email.trim()) {
      return "Username or email is required.";
    }
    if (!password) {
      return "Password is required.";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      await login({
        email: email.trim(),
        password,
        remember_me: rememberMe,
      });

      const from =
        (location.state as { from?: { pathname?: string } } | null)?.from
          ?.pathname ?? "/products";

      navigate(from, {
        replace: true,
      });
    } catch (error) {
      if (!isAuthError(error)) {
        setError("Unable to log in. Please try again.");
        return;
      }

      switch (error.code) {
        case "INVALID_CREDENTIALS":
          setError("Invalid username or password.");
          break;

        case "NETWORK_ERROR":
          setError("Unable to connect to the server. Please try again.");
          break;

        case "SERVER_ERROR":
          setError("Something went wrong. Please try again later.");
          break;

        default:
          setError("Unable to log in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProviderLogin = async (provider: OAuthProvider) => {
    setProviderLoading(provider);

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });

    try {
      await loginWithProvider(provider);
    } catch (error) {
      console.error("OAuth login failed:", error);
      setProviderLoading(null);
    }
  };
  return (
    <div className="flex min-h-full w-full items-center justify-center p-6 md:p-10">
      <div className="absolute left-8 top-8 flex items-center gap-2">
        <img
          src={interloidLogo}
          alt="Interloid"
          className="h-5 w-5 object-contain"
        />
        <span className="text-sm font-semibold">Interloid</span>
        <span className="text-sm text-muted-foreground">Workforce Suite</span>
      </div>
      <div className="w-full max-w-lg">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card className="gap-4 px-2 py-8 rounded-[10px] shadow-[rgba(0, 0, 0, 0.04) 0px 1px 2px]">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Sign in</CardTitle>
              <CardDescription className="text-muted-text">
                Use your workspace account, or a provider.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} noValidate>
                <FieldGroup className="gap-4">
                  <Field className="flex-col h-fit py-1 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 text-xs hover:bg-primary-hover"
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
                        className="h-10 flex-1 text-xs hover:bg-primary-hover"
                        disabled={providerLoading !== null}
                        onClick={() => handleProviderLogin("github")}
                      >
                        {providerLoading === "github" ? (
                          <>
                            <Spinner className="size-4" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <FaGithub className="size-4" />
                            GitHub
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 flex-1 text-xs hover:bg-primary-hover"
                        disabled={providerLoading !== null}
                        onClick={() => handleProviderLogin("microsoft")}
                      >
                        {providerLoading === "microsoft" ? (
                          <>
                            <Spinner className="size-4" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <MicrosoftLogo />
                            Microsoft
                          </>
                        )}
                      </Button>
                    </div>
                  </Field>
                  <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card text-[11px] py-1">
                    <span className="px-1"> OR </span>
                  </FieldSeparator>
                  <Field className="gap-2">
                    <FieldLabel
                      htmlFor="email"
                      className="text-[13px] font-medium"
                    >
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
                      className="h-10 px-3! text-[13px]! focus-visible:border-primary focus-visible:ring-primary/20"
                    />
                  </Field>
                  <Field className="gap-1">
                    <div className="flex items-center">
                      <FieldLabel
                        htmlFor="password"
                        className="text-[13px] font-medium"
                      >
                        Password
                      </FieldLabel>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                        required
                        className={`h-10 px-3.5! focus-visible:border-primary focus-visible:ring-primary/20 text-[13px]! ${
                          showPassword ? "tracking-normal" : "tracking-[10px]  font-bold"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-text hover:text-foreground"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        <span className="text-xs font-medium">
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-text" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-text" />
                          )}
                        </span>
                      </button>
                    </div>
                  </Field>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) =>
                        setRememberMe(checked === true)
                      }
                    />
                    <label
                      htmlFor="remember-me"
                      className="text-xs font-normal text-muted-text leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Keep me signed in on this device
                    </label>
                  </div>
                  <Field>
                    {error && (
                      <p className="text-sm text-destructive font-medium">
                        {error}
                      </p>
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
                      <Link
                        to="/passcode"
                        className="text-primary font-semibold no-underline! hover:underline!"
                      >
                        Use passcode
                      </Link>
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
