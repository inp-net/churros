// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// From https://github.com/shgysk8zer0/polyfills

export function polyfillMethod(
  parent,
  name,
  value,
  { writable = true, enumerable = true, configurable = true } = {},
) {
  if (!(parent[name] instanceof Function)) 
    Object.defineProperty(parent, name, { value, writable, enumerable, configurable });
  
}

polyfillMethod(URL, 'parse', (url, base) => {
  try {
    return new URL(url, base);
  } catch {
    return null;
  }
});

polyfillMethod(URL, 'canParse', (url, base) => {
  try {
    return new URL(url, base) instanceof URL;
  } catch {
    return false;
  }
});

/**
 * Change Array by copy proposal
 * @Note: Not clear if should use `structedClone` or `[...this]` for copies
 * @see https://github.com/tc39/proposal-change-array-by-copy
 */
if (!(Array.prototype.toReversed instanceof Function)) {
  Array.prototype.toReversed = function toReversed() {
    return [...this].reverse();
  };
}

if (!(Array.prototype.toSorted instanceof Function)) {
  Array.prototype.toSorted = function toSorted(cmpFn) {
    return [...this].sort(cmpFn);
  };
}
