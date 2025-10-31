import { Component } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background dark:bg-dark-bg p-4">
          <div className="card p-8 max-w-md text-center">
            <FiAlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-dark-text-secondary mb-6">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
