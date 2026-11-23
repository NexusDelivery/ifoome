import React from 'react';
import {
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  LogOut,
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
  onLockAdmin: () => void | Promise<void>;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onSelectTab,
  store,
  onToggleStoreOpen,
  activeOrdersCount,
  onSwitchToPublic,
  onLockAdmin,
  children,
}) => {
  const navItems: {
    id: AdminTab;
    label: string;
    mobileLabel: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Resumo do Dia',
      mobileLabel: 'Resumo',
      icon: LayoutDashboard,
    },
    {
      id: 'orders',
      label: 'Pedidos',
      mobileLabel: 'Pedidos',
      icon: ClipboardList,
      badge: activeOrdersCount,
    },
    {
      id: 'menu',
      label: 'Cardápio',
      mobileLabel: 'Cardápio',
      icon: UtensilsCrossed,
    },
    {
      id: 'settings',
      label: 'Configurações',
      mobileLabel: 'Ajustes',
      icon: Settings,
    },
  ];

  const activeTitle =
    navItems.find((item) => item.id === activeTab)?.label ?? 'Resumo do Dia';

  return (
    <div className="min-h-screen bg-[#FFF8EF] text-[#382B25] flex flex-col lg:flex-row">
      {/* Sidebar Desktop (>= lg) */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#FFFFFF] border-r border-[#EAE0D5] z-30">
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#EAE0D5]">
          <BrandMark compact logoUrl={store.logoUrl} alt={store.name} />
          <span className="text-xs font-semibold text-[#6E5D55]">Painel</span>
        </div>

        <div className="p-4 border-b border-[#F2EAE0]">
          <button
            type="button"
            onClick={onToggleStoreOpen}
            className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-colors ${
              store.isOpen
                ? 'bg-[#ECFDF3] border-[#A6F4C5] text-[#027A48]'
                : 'bg-[#FDECE9] border-[#FECDCA] text-[#B42318]'
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-bold">
              <Store className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{store.isOpen ? 'Loja aberta' : 'Loja fechada'}</span>
            </span>
            <span className="text-xs font-semibold underline">
              {store.isOpen ? 'Fechar' : 'Abrir'}
            </span>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5" aria-label="Menu administrativo">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 text-sm font-semibold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#D94B3D] text-white'
                    : 'text-[#57473F] hover:bg-[#FFF8EF] hover:text-[#382B25]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md tabular-nums font-bold ${
                      isActive
                        ? 'bg-[#FFF8EF] text-[#D94B3D]'
                        : 'bg-[#FFF3E6] text-[#B54708]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#EAE0D5] space-y-2">
          <button
            type="button"
            onClick={onSwitchToPublic}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#DDD2C6] bg-[#FFFFFF] text-sm font-semibold text-[#382B25] hover:bg-[#FFF8EF] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <ExternalLink className="w-4 h-4 text-[#F47B35]" aria-hidden="true" />
            <span>Ver cardápio público</span>
          </button>
          <button
            type="button"
            onClick={() => void onLockAdmin()}
            className="w-full min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold text-[#6E5D55] hover:bg-[#FDECE9] hover:text-[#B42318] transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Bloquear e sair do painel</span>
          </button>
        </div>
      </aside>

      {/* Top Bar Mobile (< lg) */}
      <header className="lg:hidden sticky top-0 z-30 h-14 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#EAE0D5] px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <BrandMark compact logoUrl={store.logoUrl} alt={store.name} />
          <span aria-hidden="true" className="text-[#DDD2C6]">
            /
          </span>
          <span className="text-sm font-semibold text-[#382B25] truncate">
            {activeTitle}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onToggleStoreOpen}
            className={`min-h-[38px] px-2.5 py-1 rounded-lg text-xs font-bold border whitespace-nowrap ${
              store.isOpen
                ? 'bg-[#ECFDF3] border-[#A6F4C5] text-[#027A48]'
                : 'bg-[#FDECE9] border-[#FECDCA] text-[#B42318]'
            }`}
          >
            {store.isOpen ? 'Aberta' : 'Fechada'}
          </button>

          <button
            type="button"
            onClick={onSwitchToPublic}
            className="min-h-[38px] px-2.5 py-1 rounded-lg border border-[#DDD2C6] text-xs font-semibold text-[#382B25] hover:bg-[#FFF8EF] whitespace-nowrap"
          >
            Cardápio
          </button>

          <button
            type="button"
            onClick={() => void onLockAdmin()}
            title="Sair do painel administrativo"
            aria-label="Sair do painel administrativo"
            className="min-h-[38px] min-w-[38px] px-2 py-1 rounded-lg border border-[#DDD2C6] text-[#6E5D55] hover:bg-[#FDECE9] hover:text-[#B42318] flex items-center justify-center"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Área Principal */}
      <main className="flex-1 lg:pl-64 pb-24 lg:pb-10">
        {/* Top Bar Desktop */}
        <div className="hidden lg:flex h-16 bg-[#FFFFFF] border-b border-[#EAE0D5] px-8 items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#6E5D55] font-medium">{store.name}</span>
            <span aria-hidden="true" className="text-[#DDD2C6]">
              /
            </span>
            <h1 className="font-display font-bold text-[#382B25]">{activeTitle}</h1>
          </div>

          <button
            type="button"
            onClick={onSwitchToPublic}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-[#F47B35] hover:bg-[#E06822] text-white text-xs font-semibold transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Abrir cardápio do cliente</span>
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">{children}</div>
      </main>

      {/* Bottom Tab Bar Mobile (< lg) */}
      <nav
        aria-label="Navegação administrativa mobile"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#EAE0D5] grid grid-cols-4 items-center"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`relative h-full flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-[#D94B3D]' : 'text-[#6E5D55] hover:text-[#382B25]'
              }`}
            >
              <span className="relative">
                <Icon className="w-5 h-5" aria-hidden="true" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-md bg-[#F47B35] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
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
