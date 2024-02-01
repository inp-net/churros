import { builder } from '#lib';
import * as Prisma from '@prisma/client';

export const PromotionTypeEnum = builder.enumType(Prisma.PromotionType, {
  description: 'Le type de code de promotion',
  name: 'PromotionType',
  values: {
    SIMPPS: {
      description:
        "Promotion du SIMPPS. Le SIMPPS rembourse le manque à gagner à l'AE avec l'argent de la CVEC. À utiliser sur les soirées foys et Hall Cs de l'ENSEEIHT uniquement.",
    },
  },
});
