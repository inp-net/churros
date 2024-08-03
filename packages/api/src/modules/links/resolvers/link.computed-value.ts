import { builder } from '#lib';
import { LinkType, renderURL } from '../index.js';

builder.objectField(LinkType, 'computedValue', (t) =>
  t.string({
    deprecationReason: 'Use `url` instead.',
    resolve({ value }, _, { user }) {
      return renderURL(value, user);
    },
  }),
);
