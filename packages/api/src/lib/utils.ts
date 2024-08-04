/**
 * returns an array of all the values in the given object, recursively.
 * For example, `objectValuesFlat({ a: 3, b: { c: 5, d: "example" }})` returns `[3, 5, "example"]`
 * @param obj the object to flatten
 *
 * @TODO: replace any with a generic type
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const objectValuesFlat = (obj: any): any[] => {
  const result = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object') result.push(...objectValuesFlat(obj[key]));
    else result.push(obj[key]);
  }
  return result;
};

type ObjectWithNullsAndUndefineds<T> = { [K in keyof T]: T[K] | undefined | null };
type ObjectWithUndefineds<T> = { [K in keyof T]: T[K] | undefined };

export function nullToUndefined<T>(obj: ObjectWithNullsAndUndefineds<T>): ObjectWithUndefineds<T> {
  // @ts-expect-error "could be instantiated with a different subtype of constraint 'ObjectWithMaybeUndefineds<T>'"
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, value === null ? undefined : value]),
  );
}
