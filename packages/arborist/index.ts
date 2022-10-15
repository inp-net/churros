export type Tree<T> = T & { children: Array<Tree<T>> };

export const root = Symbol('root');

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
    const children = map.get(item[idKey])?.children || [];
    const node = { ...item, children };
    map.set(item[idKey], node);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const parentId = item[parentIdKey] ?? root;
    if (!map.has(parentId)) map.set(parentId, { children: [] } as unknown as Tree<T>);

    map.get(parentId)!.children.push(node);
  }

  return map.get(root)?.children ?? [];
};

export const getAncestors = <
  T extends { id: U; parentId?: U | null | undefined },
  U extends PropertyKey = PropertyKey
>(
  list: T[],
  id: U
) => {
  const map = new Map<U, T>();
  for (const item of list) map.set(item.id, item);

  const ancestors = [];
  let current = map.get(id);
  while (current) {
    ancestors.push(current);
    current = map.get(current.parentId!);
  }

  return ancestors;
};
