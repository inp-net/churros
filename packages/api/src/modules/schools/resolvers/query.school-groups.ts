import { builder, prisma } from '#lib';
import type { Major } from '@churros/db/prisma';
import { SchoolGroup } from '../index.js';
// TODO remove or rename at least, don't really know what it's supposed to reprensent

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
        {
          names: string[];
          majors: Major[];
        }
      >();

      for (const { schools, ...major } of majors) {
        const key = schools
          .map(({ id }) => id)
          .sort()
          .join(',');

        if (!majorGroups.has(key)) {
          const names = schools.map(({ name }) => name).sort();
          majorGroups.set(key, { names, majors: [] });
        }

        majorGroups.get(key)!.majors.push(major);
      }

      return [...majorGroups.values()];
    },
  }),
);
