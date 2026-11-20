import React, { useState } from 'react';
import { CheckCircle2, Store } from 'lucide-react';
import { StoreConfig } from '../../types/ifoome';
import { formatPhoneMask } from '../../utils/formatters';

interface AdminSettingsProps {
  storeConfig: StoreConfig;
  onSaveConfig: (next: StoreConfig) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  storeConfig,
  onSaveConfig,
}) => {
  const [name, setName] = useState(storeConfig.name);
  const [subtitle, setSubtitle] = useState(storeConfig.subtitle);
  const [isOpen, setIsOpen] = useState(storeConfig.isOpen);
  const [openingHours, setOpeningHours] = useState(storeConfig.openingHours);
  const [estimatedTime, setEstimatedTime] = useState(storeConfig.estimatedTime);
  const [phone, setPhone] = useState(storeConfig.phone);
  const [pickupAddress, setPickupAddress] = useState(storeConfig.pickupAddress);
  const [deliveryFeeInput, setDeliveryFeeInput] = useState(
    storeConfig.deliveryFee.toFixed(2).replace('.', ',')
  );
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedFee = Number(deliveryFeeInput.replace(',', '.'));
    onSaveConfig({
      name: name.trim() || storeConfig.name,
      subtitle: subtitle.trim(),
      isOpen,
      openingHours: openingHours.trim(),
      estimatedTime: estimatedTime.trim(),
      phone: phone.trim(),
      pickupAddress: pickupAddress.trim(),
      deliveryFee: Number.isNaN(parsedFee) || parsedFee < 0 ? 0 : parsedFee,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#263238] tracking-tight">
          Configurações do Estabelecimento
        </h2>
        <p className="mt-1 text-sm text-[#263238]/75">
          Ajuste o nome da marmitaria, horário de funcionamento, contato e taxa de entrega.
        </p>
      </div>

      {savedNotice && (
        <div
          role="status"
          className="rounded-xl bg-[#DDEFE3] border border-[#287A55]/30 px-4 py-3 text-sm font-semibold text-[#1E6143] flex items-center gap-2.5"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span>Configurações salvas e aplicadas ao cardápio público.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="bg-white rounded-2xl border border-[#DCE6E0] p-5 sm:p-6 space-y-4">
          <h3 className="text-base font-bold text-[#263238]">Dados do restaurante</h3>

          <div>
            <label
              htmlFor="store-name"
              className="block text-sm font-semibold text-[#263238] mb-1.5"
            >
              Nome do estabelecimento
            </label>
            <input
              id="store-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DCE6E0] text-sm focus:outline-none focus:ring-2 focus:ring-[#287A55]"
            />
          </div>

          <div>
            <label
              htmlFor="store-subtitle"
              className="block text-sm font-semibold text-[#263238] mb-1.5"
            >
              Frase de apresentação no cardápio
            </label>
            <input
              id="store-subtitle"
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DCE6E0] text-sm focus:outline-none focus:ring-2 focus:ring-[#287A55]"
            />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#DCE6E0] p-5 sm:p-6 space-y-4">
          <h3 className="text-base font-bold text-[#263238]">Funcionamento e entrega</h3>

          <button
            type="button"
            role="switch"
            aria-checked={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
            className={`w-full min-h-[52px] px-4 py-3 rounded-xl border flex items-center justify-between text-sm font-semibold transition-colors ${
              isOpen
                ? 'bg-[#DDEFE3]/70 border-[#287A55]/30 text-[#1E6143]'
                : 'bg-[#F4C95D]/25 border-[#F4C95D] text-[#263238]'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Store className="w-5 h-5" aria-hidden="true" />
              <span>Recebimento de novos pedidos no cardápio</span>
            </span>
            <span className="font-bold">
              {isOpen ? 'Loja Aberta' : 'Loja Fechada'}
            </span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="store-hours"
                className="block text-sm font-semibold text-[#263238] mb-1.5"
              >
                Horário de funcionamento
              </label>
              <input
                id="store-hours"
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder="Ex.: Seg a Sáb · 10h30 às 15h00"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DCE6E0] text-sm focus:outline-none focus:ring-2 focus:ring-[#287A55]"
              />
            </div>

            <div>
              <label
                htmlFor="store-eta"
                className="block text-sm font-semibold text-[#263238] mb-1.5"
              >
                Tempo médio estimado
              </label>
              <input
                id="store-eta"
                type="text"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="Ex.: 30 a 45 min"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DCE6E0] text-sm focus:outline-none focus:ring-2 focus:ring-[#287A55]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="store-phone"
                className="block text-sm font-semibold text-[#263238] mb-1.5"
              >
                Telefone / WhatsApp de contato
              </label>
              <input
                id="store-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhoneMask(e.target.value))}
                placeholder="(11) 98765-4321"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DCE6E0] text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-[#287A55]"
              />
            </div>

            <div>
              <label
                htmlFor="store-fee"
                className="block text-sm font-semibold text-[#263238] mb-1.5"
              >
                Taxa de entrega fixa (R$)
              </label>
              <input
                id="store-fee"
                type="text"
                inputMode="decimal"
                value={deliveryFeeInput}
                onChange={(e) => setDeliveryFeeInput(e.target.value)}
                placeholder="5,00"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DCE6E0] text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-[#287A55]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="store-address"
              className="block text-sm font-semibold text-[#263238] mb-1.5"
            >
              Endereço do estabelecimento (para retirada)
            </label>
            <input
              id="store-address"
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DCE6E0] text-sm focus:outline-none focus:ring-2 focus:ring-[#287A55]"
            />
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="min-h-[48px] px-6 py-3 rounded-xl bg-[#287A55] text-white text-sm font-semibold hover:bg-[#1E6143] transition-colors"
          >
            Salvar configurações
          </button>
        </div>
      </form>
    </div>
  );
};
