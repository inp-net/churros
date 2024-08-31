import { builder } from '#lib';
import { UID_REGEX_PATTERN } from '#modules/global';
import { createUid } from '#modules/users/utils';

builder.queryField('suggestedUid', (t) =>
  t.string({
    description:
      "Génère un pseudo suggéré à partir des infos rentrées par l'utilisateur.ice en cours d'inscription",
    args: {
      firstName: t.arg.string({ description: 'Prénom' }),
      lastName: t.arg.string({ description: 'Nom de famille' }),
    },
    authScopes: () => true,
    async resolve(_, args) {
      const uid = await createUid(args);
      if (!UID_REGEX_PATTERN.test(uid)) return '';
      return uid;
    },
  }),
);
