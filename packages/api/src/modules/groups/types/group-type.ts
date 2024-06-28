import { builder } from '#lib';

import * as PrismaTypes from '@churros/db/prisma';

export const GroupEnumType = builder.enumType(PrismaTypes.GroupType, { name: 'GroupType' });
