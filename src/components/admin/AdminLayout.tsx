import React from 'react';
import {
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  Settings,
  Store,
  UtensilsCrossed,
} from 'lucide-react';
import { AdminTab, StoreSettings } from '../../types';
import { BrandMark } from '../BrandMark';

interface AdminLayoutProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  store: StoreSettings;
  onToggleStoreOpen: () => void;
  activeOrdersCount: number;
  onSwitchToPublic: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: {
  id: AdminTab;
  label: string;
  mobileLabel: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'dashboard', label: 'Visão Geral', mobileLabel: 'Painel', Icon: LayoutDashboard },
  { id: 'orders', label: 'Pedidos', mobileLabel: 'Pedidos', Icon: ClipboardList },
  { id: 'menu', label: 'Cardápio', mobileLabel: 'Cardápio', Icon: UtensilsCrossed },
  { id: 'settings', label: 'Configurações', mobileLabel: 'Loja', Icon: Settings },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onSelectTab,
  store,
  onToggleStoreOpen,
  activeOrdersCount,
  onSwitchToPublic,
  children,
}) => {
  const currentNav = NAV_ITEMS.find((item) => item.id === activeTab);

  return (
    <div className="min-h-screen bg-[#FFF8EF] text-[#382B25] flex flex-col lg:flex-row">
      {/* Sidebar Desktop (lg+) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-[#FFFFFF] border-r border-[#EAE0D5] sticky top-0 h-screen">
        <div className="px-6 py-5 border-b border-[#EAE0D5]">
          <BrandMark />
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1" aria-label="Navegação administrativa">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectTab(id)}
                className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#FFF3E6] text-[#D94B3D]'
                    : 'text-[#6E5D55] hover:bg-[#FFF8EF] hover:text-[#382B25]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </span>
                {id === 'orders' && activeOrdersCount > 0 && (
                  <span className="tabular-nums text-xs font-bold px-2 py-0.5 rounded-md bg-[#D94B3D] text-white">
                    {activeOrdersCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#EAE0D5] space-y-2.5">
          <div className="px-2 py-1 text-xs text-[#6E5D55] truncate">{store.name}</div>
          <button
            type="button"
            onClick={onSwitchToPublic}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#DDD2C6] text-sm font-semibold text-[#382B25] hover:bg-[#FFF8EF] transition-colors whitespace-nowrap"
          >
            <ExternalLink className="w-4 h-4 shrink-0 text-[#F47B35]" aria-hidden="true" />
            <span>Ver Cardápio Público</span>
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-14 lg:h-16 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#EAE0D5] px-4 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="lg:hidden">
              <BrandMark compact />
            </div>
            <span className="hidden lg:inline text-sm text-[#6E5D55]">Painel</span>
            <span className="hidden lg:inline text-[#DDD2C6]" aria-hidden="true">
              /
            </span>
            <h1 className="hidden lg:block font-display font-bold text-lg text-[#382B25] truncate">
              {currentNav?.label}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onToggleStoreOpen}
              aria-pressed={store.isOpen}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                store.isOpen
                  ? 'bg-[#ECFDF3] text-[#027A48] border-[#A6F4C5] hover:bg-[#D1FADF]'
                  : 'bg-[#FDECE9] text-[#B42318] border-[#FECDCA] hover:bg-[#FEE4E2]'
              }`}
            >
              <Store className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{store.isOpen ? 'Loja Aberta' : 'Loja Fechada'}</span>
            </button>

            <button
              type="button"
              onClick={onSwitchToPublic}
              className="lg:hidden min-h-[40px] px-3 py-1.5 rounded-xl border border-[#DDD2C6] text-xs font-semibold text-[#382B25] hover:bg-[#FFF8EF] flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#F47B35]" aria-hidden="true" />
              <span>Cardápio</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-10 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Fixed Bottom Tab Bar on Mobile (< lg) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#EAE0D5] grid grid-cols-4 items-center px-1"
        aria-label="Navegação rápida do painel"
      >
        {NAV_ITEMS.map(({ id, mobileLabel, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              className={`relative min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl transition-colors ${
                isActive ? 'text-[#D94B3D]' : 'text-[#6E5D55]'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" aria-hidden="true" />
                {id === 'orders' && activeOrdersCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D94B3D] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {activeOrdersCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold tracking-tight leading-none">
                {mobileLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
