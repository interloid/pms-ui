export function FieldError({ message }: { message?: string }) {
  return (
    <p
      className="h-4 text-xs leading-4 font-medium text-destructive"
      aria-live="polite"
    >
      {message || " "}
    </p>
  );
}
