import { builder } from '#lib';

import { Visibility } from '@churros/db/prisma';

export const VisibilityEnum = builder.enumType(Visibility, {
  name: 'Visibility',
});
