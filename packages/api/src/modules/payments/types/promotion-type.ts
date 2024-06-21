import { builder } from '#lib';

import * as Prisma from '@centraverse/db/prisma';

export const PromotionTypeEnum = builder.enumType(Prisma.PromotionType, {
  name: 'PromotionType',
});
