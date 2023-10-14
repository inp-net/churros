import { builder } from '../builder.js';

export const TeachingUnitType = builder.prismaObject('TeachingUnit', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    shortName: t.exposeString('shortName'),
    moodleId: t.exposeString('moodleId', { nullable: true }),
    subjects: t.relation('subjects'),
  }),
});
