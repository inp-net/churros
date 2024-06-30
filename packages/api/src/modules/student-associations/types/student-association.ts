import { builder, prisma } from '#lib';
import { DateTimeScalar, PicturedInterface } from '#modules/global';
import { GroupEnumType, GroupType, canCreateGroup } from '#modules/groups';

export const StudentAssociationType = builder.prismaObject('StudentAssociation', {
  interfaces: [PicturedInterface],
  fields: (t) => ({
    id: t.exposeID('id'),
    uid: t.exposeString('uid', { nullable: true }),
    description: t.exposeString('description'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    schoolId: t.exposeID('schoolId'),
    name: t.exposeString('name'),
    links: t.relation('links'),
    school: t.relation('school'),
    groups: t.prismaConnection({
      type: GroupType,
      cursor: 'id',
      args: {
        types: t.arg({ type: [GroupEnumType], required: false }),
      },
      // XXX the `query` property for t.relation does not work correctly and incorporates results that don't match the type: {in: ...} filter
      resolve: async (query, { id }, { types }) => {
        const groups = await prisma.group.findMany({
          ...query,
          where: {
            studentAssociationId: id,
            type: types ? { in: types } : undefined,
          },
        });
        return groups;
      },
    }),
    // groups: t.relation('groups', {
    //   args: {
    //     types: t.arg({ type: [GroupEnumType], required: false }),
    //   },
    //   query: ({ types }) =>
    //     types
    //       ? {
    //           where: {
    //             type: {
    //                in: (() => {
    //                  console.log({ types });
    //                  return types;
    //                })(),
    //             },
    //           },
    //         }
    //       : {},
    // }),
    contributionOptions: t.relation('contributionOptions'),
    pictureFile: t.exposeString('pictureFile'),
    groupsCount: t.int({
      description: 'Nombre de groupes reliés à cette AE',
      resolve: async ({ id }) => {
        return prisma.group.count({
          where: {
            studentAssociationId: id,
          },
        });
      },
    }),
    canCreateGroups: t.boolean({
      description: "Si l'utilsateur·ice courant·e peut créer des groupes rattachés à cette AE",
      args: {
        type: t.arg({
          type: GroupEnumType,
          required: false,
          description:
            "Quel type de groupe l'on souhaiterait créer. Si non spécifié, renvoie vrai si l'on peut créer au moins un type de groupe",
        }),
      },
      resolve: async ({ uid }, { type }, { user }) => {
        if (type) {
          return canCreateGroup(user, {
            studentAssociationUid: uid,
            type,
          });
        }

        return Object.values(GroupEnumType).some((type) =>
          canCreateGroup(user, {
            studentAssociationUid: uid,
            type,
          }),
        );
      },
    }),
  }),
});
