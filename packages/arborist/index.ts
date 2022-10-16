/**
 * This package contains various operations for working with trees.
 *
 * @module
 */

/**
 * A `T` tree is an object that has children. Children may have children too, making the type
 * definition self-referencing.
 */
export type Tree<T extends {} = {}> = T & { children: Array<Tree<T>> };

/** Root symbol, used internally. */
const root = Symbol('root');

/**
 * Creates a forest out of a list of nodes.
 *
 * A forest is a list of trees.
 *
 * @example
 *   const forest = createForest([{ id: 1 }, { id: 2, parentId: 1 }, { id: 3 }]);
 *   assert.deepStrictEqual(forest, [
 *     { id: 1, children: [{ id: 2, parentId: 1, children: [] }] },
 *     { id: 3, children: [] },
 *   ]);
 */
export const createForest = <
  T extends { [P in V]: U } & { [P in W]?: U | undefined | null },
  U extends PropertyKey = PropertyKey,
  V extends PropertyKey = 'id',
  W extends PropertyKey = 'parentId'
>(
  list: T[],
  { idKey = 'id' as V, parentIdKey = 'parentId' as W }: { idKey?: V; parentIdKey?: W } = {}
): Array<Tree<T>> => {
  const map = new Map<U | typeof root, Tree<T>>();

  for (const item of list) {
    // Try to find the children of `item`
    const children = map.get(item[idKey])?.children || [];

    // Attach them to `item` to create a tree node
    const node = { ...item, children };

    // Store the new node in the map
    map.set(item[idKey], node);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const parentId = item[parentIdKey] ?? root;
    if (!map.has(parentId)) map.set(parentId, { children: [] } as unknown as Tree<T>);

    // Attach `node` as a child of its parent or of the root
    map.get(parentId)!.children.push(node);
  }

  return map.get(root)?.children ?? [];
};

/**
 * Returns the list all the ancestors of the item of given `id`. The list starts with the node
 * queried.
 *
 * @example
 *   const ancestors = getAncestors([{ id: 1 }, { id: 2, parentId: 1 }, { id: 3 }], 2 as number);
 *   assert.deepStrictEqual(ancestors, [{ id: 2, parentId: 1 }, { id: 1 }]);
 */
export const getAncestors = <
  T extends { [K in V]: U } & { [K in W]?: U | null | undefined },
  U extends PropertyKey = PropertyKey,
  V extends PropertyKey = 'id',
  W extends PropertyKey = 'parentId'
>(
  list: T[],
  id: U,
  { idKey = 'id' as V, parentIdKey = 'parentId' as W }: { idKey?: V; parentIdKey?: W } = {}
) => {
  const map = new Map<U, T>();

  // Register all the items
  for (const item of list) map.set(item[idKey], item);

  const ancestors = [];
  let current = map.get(id);

  // Follow `current.parentId` until we reach the root
  while (current) {
    ancestors.push(current);

    // `current.parentId` may be undefined despite the non-null assertion
    // In this case, `map.get` returns `undefined`, breaking the loop
    current = map.get(current[parentIdKey]!);
  }

  return ancestors;
};
