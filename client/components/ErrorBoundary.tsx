import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details, but filter out known frame access issues
    const isFrameError = error.message?.includes('frame') || 
                        error.message?.includes('ErrorOverlay') ||
                        error.message?.includes('Cannot read properties of undefined');
    
    if (isFrameError) {
      console.warn('Frame access error caught and handled:', error.message);
      // Don't show error UI for frame access issues - they're usually from analytics
      this.setState({ hasError: false });
      return;
    }

    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return <Fallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md mx-auto text-center p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Something went wrong
      </h2>
      <p className="text-gray-600 mb-4">
        We're sorry, but something unexpected happened. Please try refreshing the page.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
      >
        Refresh Page
      </button>
      {error && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-gray-500">
            Error details
          </summary>
          <pre className="mt-2 text-xs text-gray-400 bg-gray-100 p-2 rounded">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  </div>
);

export default ErrorBoundary;
