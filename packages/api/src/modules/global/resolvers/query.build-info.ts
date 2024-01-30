import { builder, CURRENT_COMMIT, CURRENT_VERSION } from '#lib';

type BuildInfo = {
  commit: string;
  version: string;
};

export const BuildInfoType = builder.objectRef<BuildInfo>('BuildInfo').implement({
  fields: (t) => ({
    commit: t.exposeString('commit', { description: "Le hash du commit utilisé pour build l'API" }),
    version: t.exposeString('version', {
      description: "La version actuelle de l'API (et de l'application)",
    }),
  }),
});

builder.queryField('buildInfo', (t) =>
  t.field({
    type: BuildInfoType,
    description: "Retourne des informations sur le build actuel de l'API",
    resolve: () => ({
      commit: CURRENT_COMMIT,
      version: CURRENT_VERSION,
    }),
  }),
);
