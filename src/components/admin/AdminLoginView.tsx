import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  Mail,
} from 'lucide-react';
import { BrandMark } from '../BrandMark';

interface AdminLoginViewProps {
  storeName: string;
  logoUrl?: string;
  signedInEmail: string | null;
  needsPasscode: boolean;
  onGoogleSignIn: () => Promise<{
    ok: boolean;
    needsPasscode?: boolean;
    error?: string;
  }>;
  onEmailPasswordSignIn: (
    email: string,
    password: string
  ) => Promise<{
    ok: boolean;
    needsPasscode?: boolean;
    error?: string;
  }>;
  onVerifyPasscode: (password: string) => Promise<{
    ok: boolean;
    error?: string;
  }>;
  onSwitchAccount: () => void;
  onBackToMenu: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  storeName,
  logoUrl,
  signedInEmail,
  needsPasscode,
  onGoogleSignIn,
  onEmailPasswordSignIn,
  onVerifyPasscode,
  onSwitchAccount,
  onBackToMenu,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [passcodeLoading, setPasscodeLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleClick = async () => {
    setErrorMsg(null);
    setGoogleLoading(true);
    try {
      const result = await onGoogleSignIn();
      if (!result.ok && result.error) {
        setErrorMsg(result.error);
      }
    } catch {
      setErrorMsg('Erro ao conectar com a conta Google. Tente novamente.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Informe o e-mail administrativo.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Informe a senha de acesso.');
      return;
    }

    setEmailLoading(true);
    try {
      const result = await onEmailPasswordSignIn(email, password);
      if (!result.ok && result.error) {
        setErrorMsg(result.error);
      }
    } catch {
      setErrorMsg(
        'Erro ao autenticar no Firebase. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!passcode.trim()) {
      setErrorMsg('Informe a senha administrativa do painel.');
      return;
    }

    setPasscodeLoading(true);
    try {
      const result = await onVerifyPasscode(passcode);
      if (!result.ok && result.error) {
        setErrorMsg(result.error);
      }
    } catch {
      setErrorMsg(
        'Erro ao validar a senha administrativa. Tente novamente.'
      );
    } finally {
      setPasscodeLoading(false);
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

        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="space-y-2">
            <BrandMark logoUrl={logoUrl} alt={storeName} />
            <h1 className="font-display font-extrabold text-2xl text-white pt-2">
              Acesso Administrativo
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Entre para gerenciar cardápio, pedidos e configurações de{' '}
              <strong className="text-slate-100">{storeName}</strong>.
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs sm:text-sm font-medium text-red-200"
            >
              <AlertCircle
                className="w-4 h-4 shrink-0 mt-0.5 text-red-400"
                aria-hidden="true"
              />
              <span>{errorMsg}</span>
            </div>
          )}

          {needsPasscode && signedInEmail ? (
            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div className="rounded-xl bg-slate-800/80 border border-slate-700 px-4 py-3 text-xs text-slate-300 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-slate-400 block">Conta conectada:</span>
                  <strong className="text-white truncate block">
                    {signedInEmail}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setPasscode('');
                    onSwitchAccount();
                  }}
                  className="shrink-0 px-2.5 py-1.5 rounded-lg border border-slate-600 text-xs font-semibold text-slate-200 hover:bg-slate-700 inline-flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Trocar conta</span>
                </button>
              </div>

              <div className="rounded-xl bg-orange-500/10 border border-orange-500/30 px-4 py-3 text-xs text-orange-200 flex items-start gap-2.5">
                <KeyRound
                  className="w-4 h-4 text-orange-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>
                  Informe a senha administrativa do painel para confirmar a permissão desta conta.
                </span>
              </div>

              <div>
                <label
                  htmlFor="admin-passcode"
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
                    id="admin-passcode"
                    type={showPassword ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
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
                disabled={passcodeLoading}
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-60 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20"
              >
                {passcodeLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Validando acesso...</span>
                  </>
                ) : (
                  <span>Liberar Painel Administrativo</span>
                )}
              </button>
            </form>
          ) : (
            <>
              {/* Botão Login com Google */}
              <button
                type="button"
                disabled={googleLoading || emailLoading}
                onClick={() => void handleGoogleClick()}
                className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-60 text-slate-900 text-sm font-bold flex items-center justify-center gap-2.5 transition-colors shadow-lg"
              >
                {googleLoading ? (
                  <>
                    <Loader2
                      className="w-4 h-4 animate-spin text-slate-700"
                      aria-hidden="true"
                    />
                    <span>Conectando ao Google...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 shrink-0"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                      />
                    </svg>
                    <span>Entrar com Google</span>
                  </>
                )}
              </button>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-slate-800" />
                <span className="shrink mx-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  ou acesse com e-mail e senha
                </span>
                <div className="flex-grow border-t border-slate-800" />
              </div>

              <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="admin-email"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    E-mail administrativo *
                  </label>
                  <div className="relative">
                    <Mail
                      className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                      aria-hidden="true"
                    />
                    <input
                      id="admin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@empresa.com"
                      autoComplete="email"
                      className="w-full min-h-[46px] pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    Senha *
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
                      placeholder="Digite sua senha"
                      autoComplete="current-password"
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
                  disabled={emailLoading || googleLoading}
                  className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-60 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20"
                >
                  {emailLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Autenticando...</span>
                    </>
                  ) : (
                    <span>Entrar</span>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-slate-500 pt-6 relative z-10">
        Nexus Delivery · Autenticação segura via Firebase
      </p>
    </div>
  );
};
