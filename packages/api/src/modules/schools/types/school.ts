import { builder, fromYearTier, prisma } from '#lib';
import { PicturedInterface } from '#modules/global';

export const SchoolType = builder.prismaObject('School', {
  interfaces: [PicturedInterface],
  fields: (t) => ({
    id: t.exposeID('id'),
    uid: t.exposeString('uid'),
    slug: t.exposeString('uid'),
    name: t.exposeString('name'),
    color: t.exposeString('color'),
    studentAssociations: t.relation('studentAssociations'),
    majors: t.relation('majors'),
    description: t.exposeString('description'),
    address: t.exposeString('address'),
    services: t.relation('services'),
    studentMailDomain: t.exposeString('studentMailDomain'),
    aliasMailDomains: t.exposeStringList('aliasMailDomains'),
    pictureFile: t.exposeString('pictureFile'),
    canEdit: t.boolean({
      description: "L'utilisateur.ice connecté.e peut modifier les infos de l'école",
      resolve: (_, {}, { user }) => Boolean(user?.admin),
    }),
    studentsCount: t.int({
      description: "Nombre d'étudiant.e.s membres d'une filière appartenant à cette école",
      args: {
        yearTiers: t.arg.intList({
          defaultValue: [],
          description: 'Filtrer par promotions relatives (1 = 1A, 2 = 2A...)',
        }),
      },
      async resolve({ id }, { yearTiers }) {
        return prisma.user.count({
          where: {
            ...(yearTiers.length > 0
              ? { graduationYear: { in: yearTiers.map(fromYearTier) } }
              : {}),
            major: {
              schools: { some: { id } },
            },
          },
        });
      },
    }),
  }),
});
