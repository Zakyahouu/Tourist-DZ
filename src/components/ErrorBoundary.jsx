import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // In production, send to an error tracking service here (e.g. Sentry)
        if (import.meta.env.DEV) {
            console.error('[ErrorBoundary caught]', error, info.componentStack);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-brand-bg)] text-center px-6">
                    <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-10 max-w-md w-full">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-black text-slate-800 mb-2">Something went wrong</h1>
                        <p className="text-slate-500 mb-6 text-sm">
                            An unexpected error occurred. Please refresh the page or go back to the home page.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
                            >
                                Refresh Page
                            </button>
                            <a
                                href="/"
                                className="px-5 py-2.5 bg-[var(--color-brand-primary)] hover:bg-orange-500 text-white font-bold rounded-xl text-sm transition-colors"
                            >
                                Back to Home
                            </a>
                        </div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
