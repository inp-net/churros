import { builder } from '#lib';

import { EventFrequency } from '@churros/db/prisma';

export const EventFrequencyType = builder.enumType(EventFrequency, {
  name: 'EventFrequency',
});
