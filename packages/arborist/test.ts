import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import {
  createForest,
  getAncestors,
  getDescendants,
  hasCycle,
  mappedGetAncestors,
} from './index.js';

await describe('arborist', async () => {
  await it('should create a simple forest', () => {
    const forest = createForest([
      { id: 1 },
      { id: 2, parentId: 1 },
      { id: 3, parentId: 1 },
      { id: 4, parentId: 2 },
      { id: 5, parentId: 3 },
      { id: 6 },
    ]);

    assert.deepStrictEqual(forest, [
      {
        id: 1,
        children: [
          { id: 2, parentId: 1, children: [{ id: 4, parentId: 2, children: [] }] },
          { id: 3, parentId: 1, children: [{ id: 5, parentId: 3, children: [] }] },
        ],
      },
      { id: 6, children: [] },
    ]);
  });

  await it('should still work when entries are shuffled', () => {
    const forest = createForest([{ id: 3, parentId: 2 }, { id: 2, parentId: 1 }, { id: 1 }]);

    assert.deepStrictEqual(forest, [
      {
        id: 1,
        children: [{ id: 2, parentId: 1, children: [{ id: 3, parentId: 2, children: [] }] }],
      },
    ]);
  });

  await it('should return an empty array if no roots can be found', () => {
    const forest = createForest([{ id: 3, parentId: 2 }]);
    assert.deepStrictEqual(forest, []);
  });

  await it('should retrieve ancestors', () => {
    const ancestors = getAncestors(
      [
        { id: 2, parentId: 1 },
        { id: 4, parentId: 3 },
        { id: 1, parentId: undefined },
        { id: 3, parentId: 2 },
      ],
      2 as number,
    );

    assert.deepStrictEqual(ancestors, [
      { id: 2, parentId: 1 },
      { id: 1, parentId: undefined },
    ]);
  });

  await it('should retrieve descendants', () => {
    const descendants = getDescendants(
      [
        { id: 2, parentId: 1 },
        { id: 4, parentId: 3 },
        { id: 1, parentId: undefined },
        { id: 3, parentId: 2 },
      ],
      1 as number,
    );
    assert.deepStrictEqual(descendants, [
      { id: 1, parentId: undefined },
      { id: 2, parentId: 1 },
      { id: 4, parentId: 3 },
      { id: 3, parentId: 2 },
    ]);
  });

  await it('should return an empty array if the id is not found', () => {
    const ancestors = getAncestors([{ id: 1 }], 2 as number);
    assert.deepStrictEqual(ancestors, []);
  });

  await it('should retrieve mapped ancestors', () => {
    const nodes = [
      { id: 2, parentId: 1 },
      { id: 4, parentId: 3 },
      { id: 1 },
      { id: 3, parentId: 2 },
    ];
    const ancestors = mappedGetAncestors(nodes, [nodes[0], nodes[3]] as Array<{ id: number }>);

    assert.deepStrictEqual(ancestors, [
      [{ id: 2, parentId: 1 }, { id: 1 }],
      [{ id: 3, parentId: 2 }, { id: 2, parentId: 1 }, { id: 1 }],
    ]);
  });

  await it('should remap keys correctly', () => {
    const nodes = [{ x: 2, y: 1 }, { x: 4, y: 3 }, { x: 1 }, { x: 3, y: 2 }];
    const ancestors = mappedGetAncestors(nodes, [{ z: 4 as number }], {
      idKey: 'x',
      parentIdKey: 'y',
      mappedKey: 'z',
    });

    assert.deepStrictEqual(ancestors, [[{ x: 4, y: 3 }, { x: 3, y: 2 }, { x: 2, y: 1 }, { x: 1 }]]);
  });

  await it('should work with custom key', () => {
    const tree = createForest(
      [
        { id: 3, x: 1 },
        { id: 1, x: undefined },
      ],
      { parentIdKey: 'x' },
    );
    assert.deepStrictEqual(tree, [
      { id: 1, x: undefined, children: [{ id: 3, x: 1, children: [] }] },
    ]);
  });

  await it('has working examples', () => {
    // Make sure that the examples are working
    const forest = createForest([{ id: 1 }, { id: 2, parentId: 1 }, { id: 3 }]);
    assert.deepStrictEqual(forest, [
      { id: 1, children: [{ id: 2, parentId: 1, children: [] }] },
      { id: 3, children: [] },
    ]);

    const ancestors = getAncestors([{ id: 1 }, { id: 2, parentId: 1 }, { id: 3 }], 2 as number);
    assert.deepStrictEqual(ancestors, [{ id: 2, parentId: 1 }, { id: 1 }]);
  });

  await it('can detect cycles', () => {
    const actual = hasCycle([
      { id: 1, parentId: 2 },
      { id: 2, parentId: 1 },
    ]);
    assert.equal(actual, true);
  });

  void it('does not detect cycles when there are none', () => {
    const actual = hasCycle([
      { id: 1, parentId: 2 },
      { id: 2, parentId: undefined },
    ]);
    assert.equal(actual, false);
  });
});
