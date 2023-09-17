import type { ZodFormattedError } from 'zod';

export const fieldErrorsToFormattedError = <T extends {}>(
  fieldErrors: Array<{
    path: string[];
    message: string;
  }>,
) => {
  const formattedError = { _errors: [] } as unknown as ZodFormattedError<T>;

  /* eslint-disable */
  for (const { message, path } of fieldErrors) {
    let sub: any = formattedError;
    for (const key of path) sub = sub[key] ??= { _errors: [] };
    sub._errors.push(message);
  }
  /* eslint-enable */

  return formattedError;
};
