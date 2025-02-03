import { CURRENT_VERSION, builder } from '#lib';

builder.queryField('version', (t) =>
  t.string({
    description: "Version actuelle de l'API",
    resolve() {
      return CURRENT_VERSION;
    },
  }),
);
