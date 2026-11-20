import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, RotateCcw, Save, Store } from 'lucide-react';
import { StoreSettings } from '../../types';
import { formatPhoneMask } from '../../utils/format';
import { ConfirmDialog } from '../ConfirmDialog';

interface AdminSettingsProps {
  settings: StoreSettings;
  onSaveSettings: (updated: StoreSettings) => void;
  onResetDemoData: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  onSaveSettings,
  onResetDemoData,
}) => {
  const [form, setForm] = useState<StoreSettings>(settings);
  const [feeText, setFeeText] = useState(
    settings.deliveryFee.toFixed(2).replace('.', ',')
  );
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  useEffect(() => {
    setForm(settings);
    setFeeText(settings.deliveryFee.toFixed(2).replace('.', ','));
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
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
      setErrorMsg('Informe uma taxa de entrega válida (use 0,00 para entrega grátis).');
      return;
    }

    const safeFee = Math.round(parsedFee * 100) / 100;

    onSaveSettings({
      ...form,
      name: form.name.trim(),
      subtitle: form.subtitle.trim(),
      address: form.address.trim(),
      openingHours: form.openingHours.trim(),
      deliveryEstimate: form.deliveryEstimate.trim(),
      deliveryFee: safeFee,
    });
    setSavedNotice('Configurações atualizadas com sucesso.');
    window.setTimeout(() => setSavedNotice(null), 3500);
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h2 className="font-display font-bold text-2xl text-[#382B25]">
          Configurações do Restaurante
        </h2>
        <p className="text-sm text-[#6E5D55]">
          Configure o WhatsApp comercial, informações do cardápio público e taxa de entrega.
        </p>
      </div>

      {savedNotice && (
        <div
          role="status"
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#ECFDF3] border border-[#A6F4C5] text-sm font-semibold text-[#027A48]"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{savedNotice}</span>
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#FDECE9] border border-[#FECDCA] text-sm font-medium text-[#B42318]"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-[#FFFFFF] rounded-2xl border border-[#EAE0D5] p-5 sm:p-6 space-y-4"
      >
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#F2EAE0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF3E6] text-[#F47B35] flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[#382B25]">
                Status de atendimento
              </p>
              <p className="text-xs text-[#6E5D55]">
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
                ? 'bg-[#ECFDF3] text-[#027A48] border-[#A6F4C5]'
                : 'bg-[#FDECE9] text-[#B42318] border-[#FECDCA]'
            }`}
          >
            {form.isOpen ? 'Aberta' : 'Fechada'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label
              htmlFor="store-name"
              className="block text-xs font-semibold text-[#382B25] mb-1.5"
            >
              Nome do estabelecimento *
            </label>
            <input
              id="store-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DDD2C6] text-sm text-[#382B25] focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="store-subtitle"
              className="block text-xs font-semibold text-[#382B25] mb-1.5"
            >
              Descrição curta
            </label>
            <input
              id="store-subtitle"
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DDD2C6] text-sm text-[#382B25] focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
            />
          </div>

          <div>
            <label
              htmlFor="store-phone"
              className="block text-xs font-semibold text-[#382B25] mb-1.5"
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
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DDD2C6] text-sm text-[#382B25] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
            />
            <p className="text-xs text-[#6E5D55] mt-1">
              Usado para encaminhar os pedidos confirmados no WhatsApp.
            </p>
          </div>

          <div>
            <label
              htmlFor="store-hours"
              className="block text-xs font-semibold text-[#382B25] mb-1.5"
            >
              Horário de funcionamento
            </label>
            <input
              id="store-hours"
              type="text"
              value={form.openingHours}
              onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
              placeholder="Seg a Sáb · 10h30 às 15h00"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DDD2C6] text-sm text-[#382B25] focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="store-address"
              className="block text-xs font-semibold text-[#382B25] mb-1.5"
            >
              Endereço (para retirada no balcão)
            </label>
            <input
              id="store-address"
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DDD2C6] text-sm text-[#382B25] focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
            />
          </div>

          <div>
            <label
              htmlFor="store-fee"
              className="block text-xs font-semibold text-[#382B25] mb-1.5"
            >
              Taxa de entrega fixa (R$)
            </label>
            <input
              id="store-fee"
              type="text"
              inputMode="decimal"
              value={feeText}
              onChange={(e) => setFeeText(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DDD2C6] text-sm text-[#382B25] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
            />
            <p className="text-xs text-[#6E5D55] mt-1">
              Use 0,00 para oferecer entrega grátis. Retirada é sempre gratuita.
            </p>
          </div>

          <div>
            <label
              htmlFor="store-estimate"
              className="block text-xs font-semibold text-[#382B25] mb-1.5"
            >
              Tempo médio estimado
            </label>
            <input
              id="store-estimate"
              type="text"
              value={form.deliveryEstimate}
              onChange={(e) => setForm({ ...form, deliveryEstimate: e.target.value })}
              placeholder="30–45 min"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DDD2C6] text-sm text-[#382B25] focus:outline-none focus:ring-2 focus:ring-[#F47B35]"
            />
          </div>
        </div>

        <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#DDD2C6] text-xs sm:text-sm font-semibold text-[#6E5D55] hover:bg-[#FFF8EF] flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Restaurar dados de exemplo</span>
          </button>

          <button
            type="submit"
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#D94B3D] hover:bg-[#C03B2E] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            <span>Salvar Configurações</span>
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmResetOpen}
        title="Restaurar dados de demonstração?"
        description="Isso substituirá o cardápio, os pedidos e as configurações salvos neste navegador pelos exemplos iniciais."
        confirmLabel="Sim, restaurar exemplos"
        destructive
        onCancel={() => setConfirmResetOpen(false)}
        onConfirm={() => {
          onResetDemoData();
          setConfirmResetOpen(false);
          setSavedNotice('Dados de demonstração restaurados.');
          window.setTimeout(() => setSavedNotice(null), 3500);
        }}
      />
    </div>
  );
};
