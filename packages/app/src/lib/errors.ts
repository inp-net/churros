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

// I can't do Exclude<string, 'data'|'__typename'|' $fragments'> - it just evaluates back to string
// See https://stackoverflow.com/questions/51442157/type-for-every-possible-string-value-except
export type CaveatKey = 'didSoftDelete' | 'softDeleted' | 'constraintsWereSimplified';

type SuccessWithCaveats<K extends CaveatKey, TSuccess, Fragments, Typename> = {
  'data': TSuccess;
  ' $fragments': Fragments;
  '__typename': Typename;
} & Partial<Record<K, string | null>>;

type OperationResult<SuccessData, CaveatsKeys extends CaveatKey, Fragments, Typename> =
  | SuccessWithCaveats<CaveatsKeys, SuccessData, Fragments, Typename>
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

export type MutationResult<
  MutationName extends string,
  SuccessData,
  CaveatsKeys extends CaveatKey,
  Fragments,
  Typename,
> = {
  errors?: Array<{ message: string }> | null;
  data?: Record<
    MutationName,
    OperationResult<SuccessData, CaveatsKeys, Fragments, Typename>
  > | null;
};

export type SucceededMutationResult<
  MutationName extends string,
  SuccessData,
  CaveatsKeys extends CaveatKey,
  Fragments,
  Typename,
> = {
  errors?: null;
  data: Record<MutationName, SuccessWithCaveats<CaveatsKeys, SuccessData, Fragments, Typename>>;
} & Record<CaveatsKeys, string | null>;

export function mutationSucceeded<
  MutationName extends string,
  SuccessData,
  CaveatsKeys extends CaveatKey,
  Fragments,
  Typename,
>(
  mutationName: NoInfer<MutationName>,
  result: MutationResult<MutationName, SuccessData, CaveatsKeys, Fragments, Typename>,
): result is SucceededMutationResult<MutationName, SuccessData, CaveatsKeys, Fragments, Typename> {
  // @ts-expect-error TODO fix typing of operationErrorMessages's second argument
  return operationSucceeded(result, result.data?.[mutationName]);
}

export function mutationErrorMessages<
  MutationName extends string,
  D,
  CaveatsKeys extends CaveatKey,
  Fragments,
  Typename,
>(
  mutationName: NoInfer<MutationName>,
  result: MutationResult<MutationName, D, CaveatsKeys, Fragments, Typename>,
): string[] {
  // @ts-expect-error TODO fix typing of operationSucceeded's second argument
  return operationErrorMessages(result, result.data?.[mutationName]);
}

export function operationSucceeded<SuccessData, CaveatsKeys extends CaveatKey, Fragments, Typename>(
  result: { errors?: Array<{ message: string }> | null },
  operationResult: undefined | OperationResult<SuccessData, CaveatsKeys, Fragments, Typename>,
): operationResult is SuccessWithCaveats<CaveatsKeys, SuccessData, Fragments, Typename> {
  return Boolean(
    (!result.errors || result.errors.length <= 0) && operationResult && 'data' in operationResult,
  );
}

export function operationErrorMessages<T, CaveatsKeys extends CaveatKey, Fragments, Typename>(
  result: { errors?: Array<{ message: string }> | null },
  operationResult: undefined | OperationResult<T, CaveatsKeys, Fragments, Typename>,
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
