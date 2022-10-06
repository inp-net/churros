<script lang="ts">
  import type { PageData } from './$types';
  import Group from './Group.svelte';

  export let data: PageData;

  // WIP, experimenting with trees

  type Tree<T> = T & { children: Array<Tree<T>> };

  export const createTree = <
    T extends { [P in V]: U } & { [P in W]?: U | undefined | null },
    U extends PropertyKey = PropertyKey,
    V extends PropertyKey = 'id',
    W extends PropertyKey = 'parentId'
  >(
    list: T[],
    { idKey = 'id' as V, parentIdKey = 'parentId' as W }: { idKey?: V; parentIdKey?: W }
  ): Array<Tree<T>> => {
    const root = Symbol('root');
    const map = new Map<U | typeof root, Tree<T>>();

    for (const item of list) {
      const children = map.get(item[idKey])?.children || [];
      const node = { ...item, children };
      map.set(item[idKey], node);

      const parentId = item[parentIdKey] ?? root;
      if (!map.has(parentId)) map.set(parentId, { children: [] } as unknown as Tree<T>);

      map.get(parentId)!.children.push(node);
    }

    return map.get(root)?.children ?? [];
  };

  const tree = createTree(data.groups, { idKey: 'groupId' });
</script>

<ul>
  {#each tree as group}
    <li>
      <Group {group} />
    </li>
  {/each}
</ul>
