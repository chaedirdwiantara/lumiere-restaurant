import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg border border-white/10">
          <div className="text-center p-8 max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            
            <h3 className="font-display text-xl font-light mb-4 text-white">
              Something went wrong
            </h3>
            
            <p className="text-white/70 mb-6 leading-relaxed">
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-red-400 cursor-pointer mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-white/60 bg-black/40 p-4 rounded overflow-auto max-h-32">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center px-6 py-3 bg-cinema-gold hover:bg-cinema-gold/80 text-black font-light rounded-full transition-all duration-300 group"
            >
              <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface ApiErrorDisplayProps {
  error: any;
  onRetry?: () => void;
  className?: string;
}

export const ApiErrorDisplay: React.FC<ApiErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  className = '' 
}) => {
  const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.response?.data?.message) return error.response.data.message;
    return 'An unexpected error occurred';
  };

  const getErrorType = (error: any): 'network' | 'server' | 'client' | 'unknown' => {
    if (!navigator.onLine) return 'network';
    if (error?.code === 'NETWORK_ERROR') return 'network';
    if (error?.response?.status >= 500) return 'server';
    if (error?.response?.status >= 400) return 'client';
    return 'unknown';
  };

  const errorType = getErrorType(error);
  const errorMessage = getErrorMessage(error);

  const errorConfig = {
    network: {
      icon: AlertTriangle,
      title: 'Connection Error',
      message: 'Please check your internet connection and try again.',
      color: 'text-amber-400'
    },
    server: {
      icon: AlertTriangle,
      title: 'Server Error',
      message: 'Our servers are experiencing issues. Please try again later.',
      color: 'text-red-400'
    },
    client: {
      icon: AlertTriangle,
      title: 'Request Error',
      message: errorMessage,
      color: 'text-orange-400'
    },
    unknown: {
      icon: AlertTriangle,
      title: 'Error',
      message: errorMessage,
      color: 'text-red-400'
    }
  };

  const config = errorConfig[errorType];
  const Icon = config.icon;

  return (
    <div className={`text-center p-6 ${className}`}>
      <div className={`w-12 h-12 mx-auto mb-4 bg-black/20 rounded-full flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${config.color}`} />
      </div>
      
      <h4 className={`font-display text-lg font-light mb-2 ${config.color}`}>
        {config.title}
      </h4>
      
      <p className="text-white/70 text-sm mb-4 leading-relaxed">
        {config.message}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-light rounded-full transition-all duration-300 border border-white/20 hover:border-white/30"
        >
          <RefreshCw className="w-3 h-3 mr-2" />
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorBoundary;