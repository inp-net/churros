import { nanoid } from 'nanoid';
import { get, writable } from 'svelte/store';

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
  data: T;
  labels?: Toast<T>['labels'];
  showLifetime?: boolean;
  lifetime?: number;
} & Toast<T>['callbacks'];

export const toasts = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...writable([] as Array<Toast<any>>),
  add<T>(type: Toast<T>['type'], title: string, body = '', options?: ToastOptions<T>) {
    const { labels, data, closed, action, ...rest } = options ?? {
      labels: { action: '', close: '' },
      data: undefined,
    };
    const callbacks = { closed, action };
    if (Object.values(callbacks).some(Boolean) && !data)
      throw new Error("You must provide data if you're using callbacks");

    toasts._add({
      addedAt: new Date(),
      id: nanoid(),
      title,
      body,
      type,
      labels: labels ?? { action: '', close: '' },
      callbacks: callbacks ?? {},
      data: data!,
      ...rest,
    });
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
  warn<T>(title: string, body = '', options?: ToastOptions<T>) {
    toasts.add<T>('warning', title, body, options);
  },
  info<T>(title: string, body = '', options?: ToastOptions<T>) {
    toasts.add<T>('info', title, body, options);
  },
  success<T>(title: string, body = '', options?: ToastOptions<T>) {
    toasts.add<T>('success', title, body, options);
  },
  error<T>(title: string, body = '', options?: ToastOptions<T>) {
    toasts.add<T>('error', title, body, options);
  },
  debug<T>(title: string, body = '', options?: ToastOptions<T>) {
    toasts.add<T>('debug', title, body, options);
  },
  async remove(id: string) {
    const toast = get(toasts).find((toast) => toast.id === id);
    if (!toast) return;
    if (toast.callbacks?.closed) await toast.callbacks.closed(toast);

    toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  },
};
