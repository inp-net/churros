import { builder } from '#lib';

import { LogoSourceType } from '@churros/db/prisma';

export const LogoSourceTypeEnum = builder.enumType(LogoSourceType, { name: 'LogoSourceType' });
