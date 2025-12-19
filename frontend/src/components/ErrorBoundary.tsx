
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
                    <div className="bg-white p-8 rounded-xl shadow-xl max-w-2xl w-full border border-red-100">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Algo salió mal 😭</h1>
                        <p className="text-gray-600 mb-4">Ha ocurrido un error inesperado en la aplicación.</p>

                        <div className="bg-gray-100 p-4 rounded-lg overflow-auto mb-6 max-h-60">
                            <code className="text-xs text-red-800 font-mono">
                                {this.state.error?.toString()}
                            </code>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                Volver al Inicio
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Recargar Página
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
