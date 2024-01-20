import { builder } from '#lib';
import { MajorType } from '#modules/curriculum';

import type { Major } from '@prisma/client';

// TODO remove or rename at least, don't really know what it's supposed to represent

/**
 * Groups majors by school. Because a major may be split in different schools, there's a bit of
 * linking logic.
 */
export const SchoolGroup = builder
  .objectRef<{ names: string[]; majors: Major[] }>('SchoolGroup')
  .implement({
    fields: (t) => ({
      names: t.exposeStringList('names'),
      majors: t.expose('majors', { type: [MajorType] }),
    }),
  });
