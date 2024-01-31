import { builder } from '#lib';

import { LogoSourceType } from '@prisma/client';

export const LogoSourceTypeEnum = builder.enumType(LogoSourceType, { name: 'LogoSourceType' });
