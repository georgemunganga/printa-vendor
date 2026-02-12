import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: undefined,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-gray-50">
          <div className="max-w-lg w-full space-y-4 bg-white rounded-2xl shadow-xl p-8 border border-gray-200 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-400">oh oh</p>
            <h1 className="text-2xl font-semibold text-printa-black">Something went wrong</h1>
            <p className="text-sm text-gray-600">
              An unexpected error occurred. You can try again or reload the app to recover.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button className="bg-printa-red" variant="default" onClick={this.handleReset}>Try again</Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reload app
              </Button>
            </div>
            {this.state.error && (
              <pre className="text-xs text-left text-gray-500 mt-4 bg-gray-100 rounded-xl p-3 overflow-x-auto">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundaryProvider = ({ children }: ErrorBoundaryProps) => (
  <AppErrorBoundary>{children}</AppErrorBoundary>
);
