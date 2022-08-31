import type { Major } from '@prisma/client';
import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { MajorType } from './majors.js';

export const SchoolType = builder.prismaObject('School', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    color: t.exposeString('color'),
  }),
});

builder.queryField('schools', (t) =>
  t.prismaField({
    type: [SchoolType],
    resolve: async (query) => prisma.school.findMany({ ...query, orderBy: { name: 'asc' } }),
  })
);

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

builder.queryField('schoolGroups', (t) =>
  t.field({
    type: [SchoolGroup],
    async resolve() {
      const majors = await prisma.major.findMany({
        include: { schools: true },
        orderBy: { name: 'asc' },
      });
      const majorGroups = new Map<
        string,
        { names: string[]; majors: Array<{ id: number; name: string }> }
      >();

      for (const { id, name, schools } of majors) {
        const key = schools
          .map(({ id }) => id)
          .sort((a, z) => a - z)
          .join(',');

        if (!majorGroups.has(key)) {
          const names = schools.map(({ name }) => name).sort();
          majorGroups.set(key, { names, majors: [] });
        }

        majorGroups.get(key)!.majors.push({ id, name });
      }

      return [...majorGroups.values()];
    },
  })
);
