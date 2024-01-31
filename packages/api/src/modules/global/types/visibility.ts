import { builder } from '#lib';
import {} from '#modules/global';
import { Visibility } from '@prisma/client';
import {} from '../index.js';

export const VisibilityEnum = builder.enumType(Visibility, {
  name: 'Visibility',
});
