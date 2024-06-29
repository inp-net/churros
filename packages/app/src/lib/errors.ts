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

export type MutationResult<MutationName extends string, SuccessData> = {
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
    | {
        __typename: `${string}don't match this${string}`;
      }
  > | null;
};
export type SucceededMutationResult<MutationName extends string, SuccessData> = {
  errors?: Array<{ message: string }> | null;
  data: Record<
    MutationName,
    {
      data: SuccessData;
    }
  >;
};

export function mutationSucceeded<MutationName extends string, SuccessData>(
  mutationName: NoInfer<MutationName>,
  result: MutationResult<MutationName, SuccessData>,
): result is SucceededMutationResult<MutationName, SuccessData> {
  const { data, errors } = result;
  if ((errors?.length ?? 0) > 0) return false;
  if (data?.[mutationName]) {
    const result = data[mutationName];
    return result && 'data' in result;
  }
  return false;
}

export function mutationErrorMessages<MutationName extends string, D>(
  mutationName: NoInfer<MutationName>,
  result: MutationResult<MutationName, D>,
): string[] {
  const { data, errors } = result;
  if (data?.[mutationName]) {
    const mutationResult = data[mutationName];
    return mutationResult && 'fieldErrors' in mutationResult
      ? mutationResult.fieldErrors.map(
          ({ path, message }) =>
            `${path.map((part) => (/\d+/.test(part) ? (Number.parseInt(part) + 1).toString() : part)).join(': ')}: ${message}`,
        )
      : 'message' in mutationResult
        ? [mutationResult.message]
        : [];
  }
  return errors ? errors.map(({ message }) => message) : ['Erreur inconnue'];
}
