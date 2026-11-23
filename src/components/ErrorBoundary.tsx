import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const raw = error instanceof Error ? error.message : String(error);
    let friendlyMessage =
      'Ocorreu uma falha inesperada ao comunicar com o servidor. Tente recarregar a página.';

    if (raw.includes('permission') || raw.includes('PERMISSION_DENIED')) {
      friendlyMessage =
        'Sua sessão não possui permissão para esta operação no banco de dados. Verifique sua autenticação administrativa.';
    } else if (raw.toLowerCase().includes('offline')) {
      friendlyMessage =
        'Sem conexão com o banco de dados no momento. Verifique sua internet e tente novamente.';
    }

    return { hasError: true, message: friendlyMessage };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 rounded-3xl border border-slate-800 p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </div>
            <h1 className="font-display font-bold text-xl text-white">
              Algo deu errado
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-sm font-semibold inline-flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              <span>Recarregar aplicação</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
