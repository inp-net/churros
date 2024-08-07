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

type OperationResult<SuccessData> =
  | {
      data: SuccessData;
    }
  | {
      message: string;
    }
  | {
      fieldErrors: Array<{
        path: string[];
        message: string;
      }>;
    }
  | {
      __typename: `${string}don't match this${string}`;
    };

export type MutationResult<MutationName extends string, SuccessData> = {
  errors?: Array<{ message: string }> | null;
  data?: Record<MutationName, OperationResult<SuccessData>> | null | undefined;
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
  return operationSucceeded(result, result.data?.[mutationName]);
}

export function mutationErrorMessages<MutationName extends string, D>(
  mutationName: NoInfer<MutationName>,
  result: MutationResult<MutationName, D>,
): string[] {
  return operationErrorMessages(result, result.data?.[mutationName]);
}

export function operationSucceeded<SuccessData>(
  result: { errors?: Array<{ message: string }> | null },
  operationResult: undefined | OperationResult<SuccessData>,
): operationResult is { data: SuccessData } {
  return Boolean(
    (!result.errors || result.errors.length <= 0) && operationResult && 'data' in operationResult,
  );
}

export function operationErrorMessages<T>(
  result: { errors?: Array<{ message: string }> | null },
  operationResult: undefined | OperationResult<T>,
): string[] {
  if (operationResult) {
    return operationResult && 'fieldErrors' in operationResult
      ? operationResult.fieldErrors.map(
          ({ path, message }) =>
            `${path.map((part) => (/\d+/.test(part) ? (Number.parseInt(part) + 1).toString() : part)).join(': ')}: ${message}`,
        )
      : 'message' in operationResult
        ? [operationResult.message]
        : [];
  }
  return result.errors ? result.errors.map(({ message }) => message) : ['Erreur inconnue'];
}
