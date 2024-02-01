import { builder } from '#lib';

import { Visibility } from '@prisma/client';

export const VisibilityEnum = builder.enumType(Visibility, {
  description: 'Niveaux de visibilité. Sert par exemple pour les posts ou les évènements',
  name: 'Visibility',
  values: {
    GroupRestricted: { description: 'Restreint aux membres du groupe' },
    Private: { description: 'Restreint aux créateur·ice·s et aux gestionnaires' },
    Public: {
      description: 'Complètement public, même pour les utilisateur·ice·s non connecté·e·s',
    },
    SchoolRestricted: { description: "Restreint aux étudiant·e·s de l'école" },
    Unlisted: { description: 'Non répertorié. Accessible publiquement quand on possède le lien' },
  },
});
