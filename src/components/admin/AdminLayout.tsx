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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      {/* Sidebar Desktop (>= lg) */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-slate-900 border-r border-slate-800 z-30">
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
          <BrandMark compact logoUrl={store.logoUrl} alt={store.name} />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Painel
          </span>
        </div>

        <div className="p-4 border-b border-slate-800">
          <button
            type="button"
            onClick={onToggleStoreOpen}
            className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-colors ${
              store.isOpen
                ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
                : 'bg-red-500/15 border-red-500/35 text-red-300'
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
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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
                        ? 'bg-slate-950/70 text-orange-300'
                        : 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            type="button"
            onClick={onSwitchToPublic}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/70 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <ExternalLink className="w-4 h-4 text-orange-400" aria-hidden="true" />
            <span>Ver cardápio público</span>
          </button>
          <button
            type="button"
            onClick={() => void onLockAdmin()}
            className="w-full min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-red-500/15 hover:text-red-300 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Bloquear e sair do painel</span>
          </button>
        </div>
      </aside>

      {/* Top Bar Mobile (< lg) */}
      <header className="lg:hidden sticky top-0 z-30 h-14 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <BrandMark compact logoUrl={store.logoUrl} alt={store.name} />
          <span aria-hidden="true" className="text-slate-700">
            /
          </span>
          <span className="text-sm font-semibold text-slate-200 truncate">
            {activeTitle}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onToggleStoreOpen}
            className={`min-h-[38px] px-2.5 py-1 rounded-lg text-xs font-bold border whitespace-nowrap ${
              store.isOpen
                ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
                : 'bg-red-500/15 border-red-500/35 text-red-300'
            }`}
          >
            {store.isOpen ? 'Aberta' : 'Fechada'}
          </button>

          <button
            type="button"
            onClick={onSwitchToPublic}
            className="min-h-[38px] px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 whitespace-nowrap"
          >
            Cardápio
          </button>

          <button
            type="button"
            onClick={() => void onLockAdmin()}
            title="Sair do painel administrativo"
            aria-label="Sair do painel administrativo"
            className="min-h-[38px] min-w-[38px] px-2 py-1 rounded-lg border border-slate-700 text-slate-400 hover:bg-red-500/15 hover:text-red-300 flex items-center justify-center"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Área Principal */}
      <main className="flex-1 lg:pl-64 pb-24 lg:pb-10">
        {/* Top Bar Desktop */}
        <div className="hidden lg:flex h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-8 items-center justify-between gap-6 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 font-medium">{store.name}</span>
            <span aria-hidden="true" className="text-slate-700">
              /
            </span>
            <h1 className="font-display font-bold text-white">{activeTitle}</h1>
          </div>

          <button
            type="button"
            onClick={onSwitchToPublic}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-semibold transition-all shadow-md shadow-orange-500/20 inline-flex items-center gap-2 whitespace-nowrap shrink-0"
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
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-4 items-center"
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
                isActive ? 'text-orange-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="relative">
                <Icon className="w-5 h-5" aria-hidden="true" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-md bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
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
