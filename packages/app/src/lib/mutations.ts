import { toasts } from '$lib/toasts';

/**
 * Shows an appropriate toast. Returns true if the mutation was successful.
 * @param mutationName
 * @param successMessage
 * @param errorMessage
 * @param param3
 */
export function mutationResultToast<MutationName extends string, SuccessData>(
  mutationName: MutationName,
  successMessage: string | ((data: SuccessData) => string),
  errorMessage: string,
  {
    errors,
    data,
  }: {
    errors?: Array<{ message: string }> | null;
    data?: Record<
      MutationName,
      | {
          data: SuccessData;
        }
      | {
          message: string;
        }
      | {
          fieldErrors: Array<{ path: string[]; message: string }>;
        }
    > | null;
  },
): boolean {
  if (data?.[mutationName]) {
    const result = data[mutationName];
    if (result && 'data' in result) {
      toasts.success(
        typeof successMessage === 'function' ? successMessage(result.data) : successMessage,
      );
    } else {
      toasts.error(
        errorMessage,
        result && 'fieldErrors' in result
          ? result.fieldErrors
              .map(
                ({ path, message }) =>
                  `${path.map((part) => (/\d+/.test(part) ? (Number.parseInt(part) + 1).toString() : part)).join(': ')}: ${message}`,
              )
              .join('\n')
          : result.message,
      );
    }
  } else {
    toasts.error(
      errorMessage,
      errors ? errors.map(({ message }) => message).join('\n') : 'Erreur inconnue',
    );
  }
}
