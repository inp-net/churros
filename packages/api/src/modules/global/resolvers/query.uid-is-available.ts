import { builder, uidIsFree } from '#lib';
import { UIDScalar } from '#modules/global/types';

builder.queryField('uidIsAvailable', (t) =>
  t.boolean({
    description: "Vérifie si un identifiant (un “@” dans l'interface) est disponible",
    args: { uid: t.arg({ type: UIDScalar }) },
    resolve: async (_, { uid }) => uidIsFree(uid),
  }),
);
