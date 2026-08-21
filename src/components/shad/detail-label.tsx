  export function DetailLabel({ children }: { children: React.ReactNode }) {
    return <span className="text-muted-foreground">{children}</span>;
  }

  export function DetailValue({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) {
    return <span className={className}>{children}</span>;
  }
