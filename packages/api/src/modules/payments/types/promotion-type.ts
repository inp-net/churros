import { builder } from '#lib';

import * as Prisma from '@churros/db/prisma';

export const PromotionTypeEnum = builder.enumType(Prisma.PromotionType, {
  name: 'PromotionType',
});
