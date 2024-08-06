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

/**
 * Type-safe way to get the last element of a array of type [...T, U], since pattern destructuring is not possible with the spread at the beginning, and methods like .at(-1) are not type-safe (they loose the intricate shape of the array)
 */
export function lastElement<OtherElements, LastElement>(
  value: [...OtherElements[], LastElement],
): LastElement {
  return value.at(-1) as LastElement;
}

export function areSetsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  // TODO: Move to Node 22 and use Set.prototype.isSupersetOf
  if (a.size !== b.size) return false;
  for (const item of a) if (!b.has(item)) return false;

  return true;
}
