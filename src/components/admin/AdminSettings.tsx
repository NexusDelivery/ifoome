import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  RotateCcw,
  Save,
  Store,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  ALL_PAYMENT_METHODS,
  PaymentMethod,
  StoreSettings,
} from '../../types';
import { formatPhoneMask } from '../../utils/format';
import { authService } from '../../services/authService';
import { uploadRestaurantLogo } from '../../services/storageService';
import { ConfirmDialog } from '../ConfirmDialog';
import { resolveBundledAssetUrl } from '../../utils/assetResolver';

interface AdminSettingsProps {
  settings: StoreSettings;
  currentUserEmail?: string;
  onSaveSettings: (
    updated: StoreSettings,
    previousLogoStoragePath?: string
  ) => Promise<void>;
  onResetDemoData: () => Promise<void>;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  currentUserEmail,
  onSaveSettings,
  onResetDemoData,
}) => {
  const [form, setForm] = useState<StoreSettings>(settings);
  const [previousLogoStoragePath, setPreviousLogoStoragePath] = useState<
    string | undefined
  >(settings.logoStoragePath);
  const [feeText, setFeeText] = useState(
    settings.deliveryFee.toFixed(2).replace('.', ',')
  );
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Alteração de senha administrativa
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdStatus, setPwdStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    setForm(settings);
    setPreviousLogoStoragePath(settings.logoStoragePath);
    setFeeText(settings.deliveryFee.toFixed(2).replace('.', ','));
  }, [settings]);

  const handleTogglePaymentMethod = (method: PaymentMethod) => {
    setForm((prev) => {
      const exists = prev.paymentMethods.includes(method);
      const next = exists
        ? prev.paymentMethods.filter((m) => m !== method)
        : [...prev.paymentMethods, method];
      return { ...prev, paymentMethods: next };
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    setUploadingLogo(true);
    try {
      const uploaded = await uploadRestaurantLogo(file);
      setForm((prev) => ({
        ...prev,
        logoUrl: uploaded.url,
        logoStoragePath: uploaded.storagePath,
      }));
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Não foi possível enviar o logotipo.'
      );
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSavedNotice(null);

    if (form.name.trim().length < 2) {
      setErrorMsg('Informe o nome do estabelecimento.');
      return;
    }

    const phoneDigits = form.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setErrorMsg(
        'Informe um telefone/WhatsApp comercial válido com DDD (10 ou 11 dígitos) para receber encaminhamentos de pedidos.'
      );
      return;
    }

    const parsedFee = Number(feeText.replace(',', '.'));
    if (Number.isNaN(parsedFee) || parsedFee < 0) {
      setErrorMsg(
        'Informe uma taxa de entrega válida (use 0,00 para entrega grátis).'
      );
      return;
    }

    if (form.address.trim().length < 2) {
      setErrorMsg('Informe o endereço do estabelecimento.');
      return;
    }

    if (form.openingHours.trim().length < 2) {
      setErrorMsg('Informe o horário de funcionamento.');
      return;
    }

    if (form.deliveryEstimate.trim().length < 2) {
      setErrorMsg('Informe o tempo estimado de entrega.');
      return;
    }

    if (form.paymentMethods.length === 0) {
      setErrorMsg('Selecione pelo menos uma forma de pagamento aceita.');
      return;
    }

    if ((form.logoUrl ?? '').trim().startsWith('data:')) {
      setErrorMsg(
        'Envie o logotipo pelo botão "Enviar logo" (Firebase Storage) ou informe uma URL externa.'
      );
      return;
    }

    const safeFee = Math.round(parsedFee * 100) / 100;
    setSaving(true);
    try {
      await onSaveSettings(
        {
          ...form,
          name: form.name.trim(),
          subtitle: form.subtitle.trim(),
          logoUrl: (form.logoUrl ?? '').trim(),
          address: form.address.trim(),
          openingHours: form.openingHours.trim(),
          deliveryEstimate: form.deliveryEstimate.trim(),
          deliveryFee: safeFee,
        },
        previousLogoStoragePath
      );
      setPreviousLogoStoragePath(form.logoStoragePath);
      setSavedNotice('Configurações salvas no Firebase com sucesso.');
      window.setTimeout(() => setSavedNotice(null), 3500);
    } catch {
      setErrorMsg('Erro ao salvar configurações no Firebase.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdStatus(null);

    if (!currentPassword.trim()) {
      setPwdStatus({
        type: 'error',
        message: 'Informe a senha administrativa atual.',
      });
      return;
    }

    if (newPassword.trim().length < 6) {
      setPwdStatus({
        type: 'error',
        message: 'A nova senha deve ter pelo menos 6 caracteres.',
      });
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setPwdStatus({
        type: 'error',
        message: 'A confirmação da nova senha não confere.',
      });
      return;
    }

    setPwdLoading(true);
    try {
      const result = await authService.changeAdminPassword(
        currentPassword,
        newPassword
      );
      if (!result.ok) {
        setPwdStatus({
          type: 'error',
          message: result.error ?? 'Não foi possível alterar a senha.',
        });
      } else {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPwdStatus({
          type: 'success',
          message:
            'Senha administrativa atualizada no Firebase! A senha anterior foi invalidada.',
        });
      }
    } catch {
      setPwdStatus({
        type: 'error',
        message: 'Erro ao atualizar a senha no Firebase.',
      });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl text-white">
          Configurações do Restaurante
        </h2>
        <p className="text-sm text-slate-400">
          Configure identidade visual, WhatsApp comercial, formas de pagamento, entrega e senha administrativa.
        </p>
      </div>

      {savedNotice && (
        <div
          role="status"
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-sm font-semibold text-emerald-300"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{savedNotice}</span>
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-950/60 border border-red-500/40 text-sm font-medium text-red-200"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4"
      >
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white">
                Status de atendimento
              </p>
              <p className="text-xs text-slate-400">
                Quando fechada, clientes consultam o cardápio mas não enviam pedidos.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={form.isOpen}
            onClick={() => setForm({ ...form, isOpen: !form.isOpen })}
            className={`min-h-[44px] px-4 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
              form.isOpen
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                : 'bg-red-500/15 text-red-300 border-red-500/35'
            }`}
          >
            {form.isOpen ? 'Aberta' : 'Fechada'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label
              htmlFor="store-name"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              Nome do estabelecimento *
            </label>
            <input
              id="store-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="store-subtitle"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              Descrição curta
            </label>
            <input
              id="store-subtitle"
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          {/* Logotipo do estabelecimento */}
          <div className="sm:col-span-2 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="store-logo"
                className="block text-xs font-semibold text-slate-300"
              >
                Logotipo do restaurante (opcional)
              </label>
              <div className="flex items-center gap-2">
                {form.logoUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        logoUrl: '',
                        logoStoragePath: undefined,
                      })
                    }
                    className="min-h-[34px] px-2.5 py-1 rounded-lg border border-red-500/40 text-xs font-semibold text-red-300 hover:bg-red-500/15 inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Remover</span>
                  </button>
                )}
                <label
                  className={`min-h-[34px] px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 inline-flex items-center gap-1.5 cursor-pointer ${
                    uploadingLogo ? 'opacity-60 pointer-events-none' : ''
                  }`}
                >
                  {uploadingLogo ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" aria-hidden="true" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />
                      <span>Enviar logo</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingLogo}
                    onChange={handleLogoUpload}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {form.logoUrl && (
                <img
                  src={resolveBundledAssetUrl(form.logoUrl)}
                  alt={`Logotipo de ${form.name}`}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0"
                />
              )}
              <input
                id="store-logo"
                type="text"
                value={form.logoUrl ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    logoUrl: e.target.value,
                    logoStoragePath: undefined,
                  })
                }
                placeholder="URL do logotipo ou envie uma imagem acima"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="store-phone"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              Telefone / WhatsApp comercial *
            </label>
            <input
              id="store-phone"
              type="tel"
              required
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: formatPhoneMask(e.target.value) })
              }
              placeholder="(11) 98765-4321"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 tabular-nums focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
            <p className="text-xs text-slate-400 mt-1">
              Usado para encaminhar os pedidos confirmados no WhatsApp.
            </p>
          </div>

          <div>
            <label
              htmlFor="store-hours"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              Horário de funcionamento
            </label>
            <input
              id="store-hours"
              type="text"
              value={form.openingHours}
              onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
              placeholder="Seg a Sáb · 10h30 às 15h00"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="store-address"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              Endereço (para retirada no balcão)
            </label>
            <input
              id="store-address"
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="store-fee"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              Taxa de entrega fixa (R$)
            </label>
            <input
              id="store-fee"
              type="text"
              inputMode="decimal"
              value={feeText}
              onChange={(e) => setFeeText(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 tabular-nums focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
            <p className="text-xs text-slate-400 mt-1">
              Use 0,00 para entrega grátis. Retirada é sempre gratuita.
            </p>
          </div>

          <div>
            <label
              htmlFor="store-estimate"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              Tempo médio estimado
            </label>
            <input
              id="store-estimate"
              type="text"
              value={form.deliveryEstimate}
              onChange={(e) =>
                setForm({ ...form, deliveryEstimate: e.target.value })
              }
              placeholder="20-30 min"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          {/* Formas de pagamento aceitas */}
          <div className="sm:col-span-2 space-y-2">
            <p className="text-xs font-semibold text-slate-300">
              Formas de pagamento aceitas *
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {ALL_PAYMENT_METHODS.map((method) => {
                const checked = form.paymentMethods.includes(method);
                return (
                  <label
                    key={method}
                    className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                      checked
                        ? 'border-orange-500 bg-orange-500/15 text-white'
                        : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleTogglePaymentMethod(method)}
                      className="w-4 h-4 accent-orange-500 rounded"
                    />
                    <span>{method}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 text-xs sm:text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Restaurar cardápio de exemplo</span>
          </button>

          <button
            type="submit"
            disabled={saving || uploadingLogo}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" aria-hidden="true" />
                <span>Salvar Configurações</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Segurança: Alterar senha administrativa */}
      <form
        onSubmit={handlePasswordChange}
        className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4"
      >
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">
              Segurança do Painel Administrativo
            </h3>
            <p className="text-xs text-slate-400">
              Altere a senha administrativa do painel (mínimo 6 caracteres)
              {currentUserEmail ? ` · Conectado como ${currentUserEmail}` : ''}.
            </p>
          </div>
        </div>

        {pwdStatus && (
          <div
            role={pwdStatus.type === 'error' ? 'alert' : 'status'}
            className={`px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium ${
              pwdStatus.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
                : 'bg-red-950/60 border-red-500/40 text-red-200'
            }`}
          >
            {pwdStatus.message}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label
              htmlFor="pwd-current"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              Senha atual *
            </label>
            <input
              id="pwd-current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="pwd-next"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              Nova senha *
            </label>
            <input
              id="pwd-next"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="pwd-confirm"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              Confirmar nova senha *
            </label>
            <input
              id="pwd-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pwdLoading}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
          >
            {pwdLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Atualizando...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-orange-400" aria-hidden="true" />
                <span>Alterar Senha Administrativa</span>
              </>
            )}
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmResetOpen}
        title="Restaurar cardápio de demonstração?"
        description="Isso restaurará os pratos e as configurações iniciais no Firestore (mantendo preservados os pedidos já registrados)."
        confirmLabel="Sim, restaurar exemplos"
        destructive
        onCancel={() => setConfirmResetOpen(false)}
        onConfirm={() => {
          setErrorMsg(null);
          void onResetDemoData()
            .then(() => {
              setConfirmResetOpen(false);
              setSavedNotice('Cardápio e loja de demonstração restaurados no Firebase.');
              window.setTimeout(() => setSavedNotice(null), 3500);
            })
            .catch(() => {
              setConfirmResetOpen(false);
              setErrorMsg('Não foi possível restaurar o cardápio no Firebase.');
            });
        }}
      />
    </div>
  );
};
