import { minutesToMilliseconds } from 'date-fns';
import { nanoid } from 'nanoid';
import { get, writable } from 'svelte/store';
import { debugging } from './debugging';

type MaybePromise<T> = T | Promise<T>;

export type Toast<T> = {
  addedAt: Date;
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'debug';
  labels: {
    action?: string;
    close?: string;
  };
  callbacks: {
    action?: (toast: Toast<NonNullable<T>>) => MaybePromise<void>;
    closed?: (toast: Toast<NonNullable<T>>) => MaybePromise<void>;
  };
  showLifetime?: boolean;
  lifetime?: number;
  data: T;
};

export const MAX_TOASTS_COUNT = 3;
export const TOAST_LIFETIME_MS = 3000;

type ToastOptions<T> = {
  data?: T;
  labels?: Toast<T>['labels'];
  showLifetime?: boolean;
  lifetime?: number;
} & Toast<T>['callbacks'];

export const toasts = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...writable([] as Array<Toast<any>>),
  add<T>(type: Toast<T>['type'], title: string, body = '', options?: ToastOptions<T>): string {
    const { labels, data, closed, action, ...rest } = options ?? {
      labels: { action: '', close: '' },
      data: undefined,
    };
    const callbacks = { closed, action };
    if (Object.values(callbacks).some(Boolean) && !data)
      throw new Error("You must provide data if you're using callbacks");

    const id = nanoid();
    toasts._add({
      addedAt: new Date(),
      id,
      title,
      body,
      type,
      labels: labels ?? { action: '', close: '' },
      callbacks: callbacks ?? {},
      data: data!,
      ...rest,
    });
    return id;
  },
  _add<T>(toast: Toast<T>) {
    toasts.update((ts) => [
      ...ts.slice(0, MAX_TOASTS_COUNT - 1),
      {
        ...toast,
        title: toast.body ? toast.title : '',
        body: toast.body || toast.title,
      },
    ]);
  },
  warn<T>(title: string, body = '', options?: ToastOptions<T>): string {
    return toasts.add<T>('warning', title, body, options);
  },
  info<T>(title: string, body = '', options?: ToastOptions<T>): string {
    return toasts.add<T>('info', title, body, options);
  },
  success<T>(title: string, body = '', options?: ToastOptions<T>): string {
    return toasts.add<T>('success', title, body, options);
  },
  error<T>(title: string, body = '', options?: ToastOptions<T>): string {
    const wordsCount = body.split(' ').length + title.split(' ').length;
    options = {
      lifetime:
        // assuming reading speed of 300 words per minute
        3000 + minutesToMilliseconds(wordsCount / 300),
      ...options,
    };
    return toasts.add<T>('error', title, body, options);
  },
  debug<T>(title: string, body = '', options?: ToastOptions<T>): string | undefined {
    if (!get(debugging)) return undefined;
    return toasts.add<T>('debug', title, body, options);
  },
  async remove(id: string) {
    const toast = get(toasts).find((toast) => toast.id === id);
    if (!toast) return;
    if (toast.callbacks?.closed) await toast.callbacks.closed(toast);

    toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  },
};
