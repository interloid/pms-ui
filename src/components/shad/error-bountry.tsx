  import { Component, type ReactNode } from "react";

  export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
    state = { hasError: false };
    static getDerivedStateFromError() { return { hasError: true }; }
    render() {
      if (this.state.hasError) {
        return (
          <div className="flex min-h-screen flex-col items-center justify-center gap-3">
            <p className="text-sm">Something went wrong.</p>
            <button onClick={() => window.location.reload()} className="underline">Reload</button>
          </div>
        );
      }
      return this.props.children;
    }
  }