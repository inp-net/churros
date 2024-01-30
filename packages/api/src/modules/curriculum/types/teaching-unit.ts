import { builder } from '#lib';

export const TeachingUnitType = builder.prismaObject('TeachingUnit', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    shortName: t.exposeString('shortName'),
    apogeeCode: t.exposeString('apogeeCode', { nullable: true }),
    subjects: t.relation('subjects'),
  }),
});
