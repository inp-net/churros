import { builder } from '#lib';

import * as Prisma from '@centraverse/db/prisma';

export const DocumentTypeEnum = builder.enumType(Prisma.DocumentType, {
  name: 'DocumentType',
});
