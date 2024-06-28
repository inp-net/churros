import { builder } from '#lib';

import * as Prisma from '@churros/db/prisma';

export const DocumentTypeEnum = builder.enumType(Prisma.DocumentType, {
  name: 'DocumentType',
});
