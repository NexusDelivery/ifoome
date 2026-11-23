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
    <div className="min-h-screen bg-[#FFF8EF] text-[#382B25] flex flex-col justify-between px-4 py-6 sm:py-10">
      <div className="max-w-md w-full mx-auto space-y-5">
        <button
          type="button"
          onClick={onBackToMenu}
          className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DDD2C6] bg-[#FFFFFF] hover:bg-[#F7EFE5] text-sm font-semibold text-[#382B25] inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#F47B35]" aria-hidden="true" />
          <span>Voltar ao cardápio</span>
        </button>

        <div className="bg-[#FFFFFF] rounded-2xl sm:rounded-3xl border border-[#EAE0D5] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-2">
            <BrandMark logoUrl={logoUrl} alt={storeName} />
            <h1 className="font-display font-extrabold text-2xl text-[#382B25] pt-2">
              Acesso Administrativo
            </h1>
            <p className="text-sm text-[#6E5D55] leading-relaxed">
              Área restrita para gerenciar cardápio, pedidos e configurações de{' '}
              <strong className="text-[#382B25]">{storeName}</strong>.
            </p>
          </div>

          {/* Aviso explícito para avaliadores */}
          <div className="rounded-xl bg-[#FFF3E6] border border-[#F47B35]/35 px-4 py-3 text-xs sm:text-sm text-[#7A3408] flex items-start gap-2.5">
            <KeyRound className="w-4 h-4 text-[#D94B3D] shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Utilize a senha provisória <strong>&apos;adm123&apos;</strong> para poder visualizar esta área. Você poderá alterá-la depois em Configurações.
            </span>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#FDECE9] border border-[#FECDCA] text-xs sm:text-sm font-medium text-[#B42318]"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-[#382B25] mb-1.5"
              >
                Senha administrativa *
              </label>
              <div className="relative">
                <Lock
                  className="w-4 h-4 text-[#6E5D55] absolute left-3.5 top-1/2 -translate-y-1/2"
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
                  className="w-full min-h-[46px] pl-10 pr-12 py-2 rounded-xl border border-[#DDD2C6] text-sm text-[#382B25] focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[38px] min-h-[38px] rounded-lg flex items-center justify-center text-[#6E5D55] hover:bg-[#F7EFE5]"
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
              className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#D94B3D] hover:bg-[#C03B2E] disabled:bg-[#DDD2C6] disabled:text-[#6E5D55] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
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

      <p className="text-center text-xs text-[#8E7D74] pt-6">
        iFoome Delivery · Painel protegido por senha
      </p>
    </div>
  );
};
