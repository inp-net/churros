import { builder, prisma } from '#lib';

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
          majors: Array<{
            id: string;
            uid: string;
            ldapSchoolUid: string | null;
            name: string;
            shortName: string;
          }>;
        }
      >();

      for (const { id, uid, ldapSchoolUid, name, shortName, schools } of majors) {
        const key = schools
          .map(({ id }) => id)
          .sort()
          .join(',');

        if (!majorGroups.has(key)) {
          const names = schools.map(({ name }) => name).sort();
          majorGroups.set(key, { names, majors: [] });
        }

        majorGroups.get(key)!.majors.push({ id, uid, ldapSchoolUid, name, shortName });
      }

      return [...majorGroups.values()];
    },
  }),
);
