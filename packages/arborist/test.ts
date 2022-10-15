import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { createForest, getAncestors } from './index.js';

describe('pojo-tree', () => {
  it('should build a simple tree', () => {
    const trees = createForest([
      { id: 1, parentId: undefined },
      { id: 2, parentId: 1 },
      { id: 3, parentId: 1 },
      { id: 4, parentId: 2 },
      { id: 5, parentId: 3 },
    ]);

    assert.deepStrictEqual(trees, [
      {
        id: 1,
        parentId: undefined,
        children: [
          {
            id: 2,
            parentId: 1,
            children: [{ id: 4, parentId: 2, children: [] }],
          },
          {
            id: 3,
            parentId: 1,
            children: [{ id: 5, parentId: 3, children: [] }],
          },
        ],
      },
    ]);
  });

  it('should build a simple tree with shuffled entries', () => {
    const trees = createForest([
      { id: 3, parentId: 2 },
      { id: 2, parentId: 1 },
      { id: 1, parentId: undefined },
    ]);

    assert.deepStrictEqual(trees, [
      {
        id: 1,
        parentId: undefined,
        children: [
          {
            id: 2,
            parentId: 1,
            children: [{ id: 3, parentId: 2, children: [] }],
          },
        ],
      },
    ]);
  });

  it('should return an empty array if no roots can be found', () => {
    const trees = createForest([{ id: 3, parentId: 2 }]);
    assert.deepStrictEqual(trees, []);
  });

  it('should retrieve ancestors', () => {
    const ancestors = getAncestors(
      [
        { id: 2, parentId: 1 },
        { id: 4, parentId: 3 },
        { id: 1, parentId: undefined },
        { id: 3, parentId: 2 },
      ],
      2 as number
    );

    assert.deepStrictEqual(ancestors, [
      { id: 2, parentId: 1 },
      { id: 1, parentId: undefined },
    ]);
  });

  it('should work with custom key', () => {
    const tree = createForest(
      [
        { id: 3, x: 1 },
        { id: 1, x: undefined },
      ],
      { parentIdKey: 'x' }
    );
    assert.deepStrictEqual(tree, [
      { id: 1, x: undefined, children: [{ id: 3, x: 1, children: [] }] },
    ]);
  });
});
