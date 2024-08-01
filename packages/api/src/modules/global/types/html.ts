import { builder } from '#lib';

export const HTMLScalar = builder.scalarType('HTML', {
  parseValue() {
    throw new Error('HTML input not allowed, use Markdown.');
  },
  serialize: (s) => s,
});
