import { builder, ENV, storageRoot } from '#lib';
import { URLScalar } from '#modules/global';
import { findExistingGdprExport } from '#modules/users';
import { UserType } from '#modules/users/types';
import path from 'node:path';

builder.prismaObjectField(UserType, 'gdprExport', (t) =>
  t.field({
    type: URLScalar,
    nullable: true,
    description:
      "Lien de téléchargement de l'export RGPD de données personnelles. Si aucun export n'existe, renvoie null. Voir Mutation.createGdprExport pour créer un export.",
    // Le $granted: 'me' donne le droit de résoudre ce champ si l'objet User EST l'User connecté.
    // Les liens sont dans storage qui a pas (pour l'instant) de moyen d'authentification, donc ouais.
    authScopes: { admin: true, $granted: 'me' },
    async resolve(_, __, { user }) {
      const gdprExport = await findExistingGdprExport(user);
      if (!gdprExport) return null;
      return new URL(`${ENV.PUBLIC_STORAGE_URL}/${path.relative(storageRoot(), gdprExport)}`);
    },
  }),
);
