import faviconUrl from '../assets/favicon.svg';
import { Order } from '../types';
import { resolveBundledAssetUrl } from './assetResolver';
import { formatCurrency } from './format';

const ADMIN_ORDERS_NOTIF_PROMPT_KEY = 'nexus_admin_orders_notif_prompt_v1';
const ADMIN_ORDERS_SOUND_ENABLED_KEY = 'nexus_admin_orders_sound_enabled_v1';

let sharedAudioContext: AudioContext | null = null;

function getAudioContextConstructor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  const win = window as Window & {
    webkitAudioContext?: typeof AudioContext;
  };
  return window.AudioContext ?? win.webkitAudioContext ?? null;
}

function getOrCreateAudioContext(): AudioContext | null {
  const Ctor = getAudioContextConstructor();
  if (!Ctor) return null;
  if (!sharedAudioContext) {
    try {
      sharedAudioContext = new Ctor();
    } catch {
      return null;
    }
  }
  return sharedAudioContext;
}

export function isNotificationSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(ADMIN_ORDERS_SOUND_ENABLED_KEY) !== '0';
  } catch {
    return true;
  }
}

export function setNotificationSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      ADMIN_ORDERS_SOUND_ENABLED_KEY,
      enabled ? '1' : '0'
    );
  } catch {
    // Ignore storage errors
  }
}

export function unlockNotificationAudio(): void {
  const ctx = getOrCreateAudioContext();
  if (!ctx || ctx.state !== 'suspended') return;
  try {
    void ctx.resume().catch(() => {
      // Ignore autoplay resume errors prior to user gesture
    });
  } catch {
    // Ignore AudioContext resume errors
  }
}

export async function playNewOrderNotificationSound(
  force = false
): Promise<void> {
  if (!force && !isNotificationSoundEnabled()) {
    return;
  }

  const ctx = getOrCreateAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    if (ctx.state !== 'running') {
      return;
    }

    const now = ctx.currentTime;
    const notes = [
      { frequency: 880, startOffset: 0, duration: 0.2 }, // Lá 5
      { frequency: 1174.66, startOffset: 0.14, duration: 0.34 }, // Ré 6
    ];

    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + note.startOffset;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.frequency, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.22, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + note.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + note.duration + 0.02);
    }
  } catch {
    // Ignore audio playback errors in restricted contexts
  }
}

export function isBrowserNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getBrowserNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isBrowserNotificationSupported()) {
    return 'unsupported';
  }
  return window.Notification.permission;
}

export function hasSeenAdminOrdersNotificationPrompt(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(ADMIN_ORDERS_NOTIF_PROMPT_KEY) === '1';
  } catch {
    return false;
  }
}

export function markAdminOrdersNotificationPromptSeen(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ADMIN_ORDERS_NOTIF_PROMPT_KEY, '1');
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

export async function requestBrowserNotificationPermission(): Promise<
  NotificationPermission | 'unsupported'
> {
  if (!isBrowserNotificationSupported()) {
    return 'unsupported';
  }
  try {
    return await window.Notification.requestPermission();
  } catch {
    return window.Notification.permission;
  }
}

export function showNewOrderBrowserNotification(
  order: Order,
  storeName: string,
  iconUrl: string | undefined,
  onSelectOrder: (orderId: string) => void
): void {
  if (!isBrowserNotificationSupported() || window.Notification.permission !== 'granted') {
    return;
  }

  const modalityLabel = order.modality === 'entrega' ? 'Entrega' : 'Retirada';
  const body = `${order.customerName} · ${formatCurrency(order.total)} (${modalityLabel})`;
  const resolvedIcon = resolveBundledAssetUrl(iconUrl) || faviconUrl;

  try {
    const notification = new window.Notification(`Novo pedido ${order.code} — ${storeName}`, {
      body,
      icon: resolvedIcon,
      tag: `order-${order.id}`,
    });

    notification.onclick = () => {
      try {
        window.focus();
      } catch {
        // Ignore focus restrictions in embedded contexts
      }
      onSelectOrder(order.id);
      notification.close();
    };
  } catch {
    // Some embedded contexts restrict direct Notification construction without SW
  }
}
