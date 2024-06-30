import { track } from '$lib/analytics';
import {
  mutationErrorMessages,
  mutationSucceeded,
  type MutationResult,
  type SucceededMutationResult,
} from '$lib/errors';
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
  add<T>(
    type: Toast<T>['type'],
    title: string,
    body = '',
    options?: ToastOptions<T>,
  ): string | undefined {
    if (!title) return;
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
  warn<T>(title: string, body = '', options?: ToastOptions<T>): string | undefined {
    return toasts.add<T>('warning', title, body, options);
  },
  info<T>(title: string, body = '', options?: ToastOptions<T>): string | undefined {
    return toasts.add<T>('info', title, body, options);
  },
  success<T>(title: string, body = '', options?: ToastOptions<T>): string | undefined {
    return toasts.add<T>('success', title, body, options);
  },
  error<T>(title: string, body = '', options?: ToastOptions<T>): string | undefined {
    const wordsCount = body.split(' ').length + title.split(' ').length;
    options = {
      lifetime:
        // assuming reading speed of 300 words per minute
        3000 + minutesToMilliseconds(wordsCount / 300),
      ...options,
    };
    track('error-toast-shown', {
      title,
      body,
    });
    return toasts.add<T>('error', title, body, options);
  },
  debug<T>(title: string, body = '', options?: ToastOptions<T>): string | undefined {
    if (!get(debugging)) return undefined;
    return toasts.add<T>('debug', title, body, options);
  },
  /**
   * Shows an appropriate toast. Returns true if the mutation was successful.
   * @param mutationName
   * @param successMessage
   * @param errorMessage
   * @param param3
   */
  mutation<MutationName extends string, SuccessData>(
    mutationName: NoInfer<MutationName>,
    successMessage: string | ((data: SuccessData) => string),
    errorMessage: string,
    result: MutationResult<MutationName, SuccessData>,
  ): result is SucceededMutationResult<MutationName, SuccessData> {
    if (mutationSucceeded(mutationName, result)) {
      toasts.success(
        typeof successMessage === 'function'
          ? successMessage(result.data[mutationName].data)
          : successMessage,
      );
      return true;
    }

    toasts.error(errorMessage, mutationErrorMessages(mutationName, result).join('; '));
    return false;
  },
  async remove(id: string) {
    const toast = get(toasts).find((toast) => toast.id === id);
    if (!toast) return;
    if (toast.callbacks?.closed) await toast.callbacks.closed(toast);

    toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  },
};
