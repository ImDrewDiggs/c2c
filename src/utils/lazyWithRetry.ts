import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

const RELOAD_FLAG = 'c2c:chunk-reload-at';
const RELOAD_COOLDOWN_MS = 30_000;

/**
 * Wraps React.lazy so a failed dynamic import (typically a stale chunk after a
 * new deploy) is retried once, then recovered by a single hard reload.
 * The cooldown flag prevents infinite reload loops when the network is truly down.
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      // One immediate retry handles transient network hiccups.
      try {
        return await factory();
      } catch (retryError) {
        if (typeof window !== 'undefined') {
          const last = Number(window.sessionStorage.getItem(RELOAD_FLAG) ?? 0);
          if (!Number.isFinite(last) || Date.now() - last > RELOAD_COOLDOWN_MS) {
            window.sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
            window.location.reload();
            // Never resolves; the page is reloading.
            return await new Promise<{ default: T }>(() => {});
          }
        }
        throw retryError;
      }
    }
  });
}
