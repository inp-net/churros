import { builder } from '#lib';

import { Visibility } from '@prisma/client';

export const VisibilityEnum = builder.enumType(Visibility, {
  name: 'Visibility',
});
