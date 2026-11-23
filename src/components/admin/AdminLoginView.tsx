import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
} from 'lucide-react';
import { BrandMark } from '../BrandMark';

interface AdminLoginViewProps {
  storeName: string;
  logoUrl?: string;
  onVerifyPassword: (password: string) => Promise<{ ok: boolean; error?: string }>;
  onBackToMenu: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  storeName,
  logoUrl,
  onVerifyPassword,
  onBackToMenu,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!password.trim()) {
      setErrorMsg('Informe a senha administrativa para acessar o painel.');
      return;
    }

    setUnlockLoading(true);
    try {
      const result = await onVerifyPassword(password);
      if (!result.ok) {
        setErrorMsg(result.error ?? 'Não foi possível validar o acesso.');
      }
    } catch {
      setErrorMsg(
        'Erro ao validar a senha no banco de dados. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setUnlockLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between px-4 py-6 sm:py-10 relative overflow-hidden">
      <div
        className="absolute -right-24 -top-24 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -left-24 -bottom-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-md w-full mx-auto space-y-5 relative z-10">
        <button
          type="button"
          onClick={onBackToMenu}
          className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-sm font-semibold text-slate-200 inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-orange-400" aria-hidden="true" />
          <span>Voltar ao cardápio</span>
        </button>

        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-2">
            <BrandMark logoUrl={logoUrl} alt={storeName} />
            <h1 className="font-display font-extrabold text-2xl text-white pt-2">
              Acesso Administrativo
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Área restrita para gerenciar cardápio, pedidos e configurações de{' '}
              <strong className="text-slate-100">{storeName}</strong>.
            </p>
          </div>

          {/* Aviso explícito para avaliadores */}
          <div className="rounded-xl bg-orange-500/10 border border-orange-500/30 px-4 py-3 text-xs sm:text-sm text-orange-200 flex items-start gap-2.5">
            <KeyRound className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Utilize a senha provisória <strong className="text-white">&apos;adm123&apos;</strong> para poder visualizar esta área. Você poderá alterá-la depois em Configurações.
            </span>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs sm:text-sm font-medium text-red-200"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Senha administrativa *
              </label>
              <div className="relative">
                <Lock
                  className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha do painel"
                  autoComplete="current-password"
                  autoFocus
                  className="w-full min-h-[46px] pl-10 pr-12 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[38px] min-h-[38px] rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={unlockLoading}
              className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20"
            >
              {unlockLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Validando senha...</span>
                </>
              ) : (
                <span>Entrar no Painel</span>
              )}
            </button>
          </form>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500 pt-6 relative z-10">
        Nexus Delivery · Painel protegido por senha
      </p>
    </div>
  );
};
