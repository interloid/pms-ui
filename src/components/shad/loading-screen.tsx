import { Spinner } from "../ui/spinner";

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-2">
      <Spinner />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}
