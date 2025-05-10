'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@heroui/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Global error boundary component to catch and display errors in the UI
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log the error to an error reporting service
    console.error('Uncaught error:', error, errorInfo);
    
    // Here you could send the error to your error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
          <div className="mb-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <div className="mb-6 max-w-lg mx-auto">
            <p className="text-gray-600 mb-2">
              An unexpected error has occurred. Our team has been notified.
            </p>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md text-left overflow-auto max-h-[200px] text-sm">
                <p className="font-semibold text-red-600">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <pre className="mt-2 text-xs text-gray-700">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <Button onClick={() => window.location.reload()} variant="solid">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Page
            </Button>
            <Button onClick={this.handleReset}>
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
