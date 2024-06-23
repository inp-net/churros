import { builder } from '#lib';

import { Visibility } from '@centraverse/db/prisma';

export const VisibilityEnum = builder.enumType(Visibility, {
  name: 'Visibility',
});
