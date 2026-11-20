import React from 'react';
import {
  ClipboardList,
  ExternalLink,
  Info,
  LayoutDashboard,
  Settings,
  Store,
  UtensilsCrossed,
} from 'lucide-react';
import { AdminSection, StoreConfig } from '../../types/ifoome';
import { BrandLogo } from '../BrandLogo';

interface AdminLayoutProps {
  activeSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  activeOrdersCount: number;
  storeConfig: StoreConfig;
  onToggleStoreOpen: () => void;
  onSwitchToPublic: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeSection,
  onSelectSection,
  activeOrdersCount,
  storeConfig,
  onToggleStoreOpen,
  onSwitchToPublic,
  children,
}) => {
  const navItems: {
    id: AdminSection;
    label: string;
    mobileLabel: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Painel e Resumo',
      mobileLabel: 'Painel',
      icon: LayoutDashboard,
    },
    {
      id: 'pedidos',
      label: 'Pedidos',
      mobileLabel: 'Pedidos',
      icon: ClipboardList,
      badge: activeOrdersCount,
    },
    {
      id: 'cardapio',
      label: 'Cardápio',
      mobileLabel: 'Cardápio',
      icon: UtensilsCrossed,
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      mobileLabel: 'Loja',
      icon: Settings,
    },
  ];

  const activeTitle =
    navItems.find((item) => item.id === activeSection)?.label || 'Painel';

  return (
    <div className="min-h-screen bg-[#F6F9F7] flex flex-col lg:flex-row">
      {/* Sidebar Desktop (>= lg) */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-[#DCE6E0] z-30">
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#E6EFEA]">
          <BrandLogo variant="compact" />
          <span className="text-xs font-semibold text-[#263238]/60">Lojista</span>
        </div>

        <div className="p-4 border-b border-[#E6EFEA]">
          <button
            type="button"
            onClick={onToggleStoreOpen}
            className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-colors ${
              storeConfig.isOpen
                ? 'bg-[#DDEFE3]/70 border-[#287A55]/30 text-[#1E6143]'
                : 'bg-[#F4C95D]/25 border-[#F4C95D] text-[#263238]'
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-bold">
              <Store className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{storeConfig.isOpen ? 'Loja aberta' : 'Loja fechada'}</span>
            </span>
            <span className="text-xs font-semibold underline">
              {storeConfig.isOpen ? 'Fechar' : 'Abrir'}
            </span>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5" aria-label="Menu administrativo">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 text-sm font-semibold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#287A55] text-white'
                    : 'text-[#263238]/80 hover:bg-[#DDEFE3]/50 hover:text-[#263238]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`font-mono text-xs px-2 py-0.5 rounded-md tabular-nums ${
                      isActive
                        ? 'bg-[#F4C95D] text-[#263238] font-bold'
                        : 'bg-[#F4C95D]/40 text-[#263238]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#E6EFEA] space-y-2">
          <button
            type="button"
            onClick={onSwitchToPublic}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#DCE6E0] bg-white text-sm font-semibold text-[#263238] hover:bg-[#F6F9F7] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <ExternalLink className="w-4 h-4 text-[#287A55]" aria-hidden="true" />
            <span>Ver cardápio público</span>
          </button>
        </div>
      </aside>

      {/* Top Bar Mobile (< lg) - altura compacta 52px */}
      <header className="lg:hidden sticky top-0 z-30 h-[52px] bg-white/95 backdrop-blur-md border-b border-[#DCE6E0] px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <BrandLogo variant="compact" />
          <span aria-hidden="true" className="text-[#263238]/30">/</span>
          <span className="text-sm font-semibold text-[#263238] truncate">
            {activeTitle}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleStoreOpen}
            className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-bold border whitespace-nowrap ${
              storeConfig.isOpen
                ? 'bg-[#DDEFE3] border-[#287A55]/30 text-[#1E6143]'
                : 'bg-[#F4C95D]/35 border-[#F4C95D] text-[#263238]'
            }`}
          >
            {storeConfig.isOpen ? 'Aberta' : 'Fechada'}
          </button>

          <button
            type="button"
            onClick={onSwitchToPublic}
            aria-label="Abrir cardápio público"
            className="min-h-[36px] px-2.5 py-1 rounded-lg border border-[#DCE6E0] text-xs font-semibold text-[#263238] hover:bg-[#F6F9F7] whitespace-nowrap"
          >
            Cardápio
          </button>
        </div>
      </header>

      {/* Área Principal */}
      <main className="flex-1 lg:pl-64 pb-24 lg:pb-10">
        {/* Top Bar Desktop */}
        <div className="hidden lg:flex h-16 bg-white border-b border-[#DCE6E0] px-8 items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#263238]/60 font-medium">{storeConfig.name}</span>
            <span aria-hidden="true" className="text-[#263238]/30">/</span>
            <h1 className="font-bold text-[#263238]">{activeTitle}</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onSwitchToPublic}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-[#287A55] text-white text-xs font-semibold hover:bg-[#1E6143] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Abrir visão do cliente</span>
            </button>
          </div>
        </div>

        {/* Faixa honesta de dados demonstrativos */}
        <div className="bg-[#DDEFE3]/55 border-b border-[#287A55]/15 px-4 sm:px-8 py-2">
          <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs text-[#263238]/85">
            <Info className="w-4 h-4 text-[#287A55] shrink-0" aria-hidden="true" />
            <span>
              <strong>Modo demonstrativo (Etapa UX/UI):</strong> pedidos e produtos iniciais são exemplos ilustrativos para validação visual no celular e desktop.
            </span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">{children}</div>
      </main>

      {/* Bottom Tab Bar Mobile (< lg) - altura 64px na zona do polegar */}
      <nav
        aria-label="Navegação administrativa mobile"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-md border-t border-[#DCE6E0] grid grid-cols-4 items-center"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSection(item.id)}
              className={`relative h-full flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-[#287A55]' : 'text-[#263238]/65 hover:text-[#263238]'
              }`}
            >
              <span className="relative">
                <Icon className="w-5 h-5" aria-hidden="true" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-md bg-[#F4C95D] text-[#263238] font-mono text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {item.badge}
                  </span>
                )}
              </span>
              <span className="text-[11px] font-semibold leading-none">
                {item.mobileLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
