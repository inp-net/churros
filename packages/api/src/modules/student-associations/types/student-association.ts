import { builder, fromYearTier, prisma, toHtml } from '#lib';
import { DateTimeScalar, Email, HTMLScalar, PicturedInterface } from '#modules/global';
import { GroupEnumType, GroupType, canCreateGroup } from '#modules/groups';
import {
  canContributeTo,
  canEditDetails,
  userContributesTo,
} from '#modules/student-associations/utils';
import type { Prisma } from '@churros/db/prisma';

export const StudentAssociationPrismaIncludes = {
  contributionOptions: true,
  board: true,
} as const satisfies Prisma.StudentAssociationInclude;

export const StudentAssociationType = builder.prismaObject('StudentAssociation', {
  interfaces: [PicturedInterface],
  include: StudentAssociationPrismaIncludes,
  fields: (t) => ({
    id: t.exposeID('id'),
    uid: t.exposeString('uid'),
    description: t.exposeString('description'),
    descriptionHtml: t.field({
      type: HTMLScalar,
      resolve: async ({ description }) => toHtml(description),
    }),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    email: t.field({
      type: Email,
      nullable: true,
      description: "Email de contact de l'AE",
      resolve({ board }) {
        return board?.email || null;
      },
    }),
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
    canEditDetails: t.boolean({
      description: "L'utilisateur.ice connecét.e peut modifier les infos de cette AE",
      resolve(sa, _, { user }) {
        return canEditDetails(user, sa);
      },
    }),
    canContribute: t.boolean({
      description: "L'utilisateur.ice connecté.e peut cotiser à cette AE",
      resolve(sa, _, { user }) {
        return canContributeTo(user, sa);
      },
    }),
    contributing: t.boolean({
      description: "L'utilisateur.ice connecté.e cotise à cette AE",
      async resolve({ id }, _, { user }) {
        const sa = await prisma.studentAssociation.findUniqueOrThrow({
          where: { id },
          include: userContributesTo.prismaIncludes,
        });
        return userContributesTo(user, sa);
      },
    }),
    hasPendingContribution: t.boolean({
      description: "Si l'utilisateur·ice connecté·e a une cotisation en attente de paiement",
      async resolve({ id }, _, { user }) {
        return Boolean(
          await prisma.contribution.count({
            where: {
              user: { uid: user?.uid },
              option: { paysFor: { some: { id } } },
              paid: false,
            },
          }),
        );
      },
    }),
    studentsCount: t.int({
      description:
        "Nombre d'étudiant.e.s rattachés à l'AE (cotisant.e.s ou non). Légalement (selon en particulier les statuts de l'AEn7), compte à la fois les membres et les étudiant.e.s susceptibles d'être membres temporaires durant un évènement organisé par l'AE",
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
              schools: { some: { studentAssociations: { some: { id } } } },
            },
          },
        });
      },
    }),
    contributorsCount: t.int({
      description:
        "Nombre de cotisant.e.s à l'AE. Légalement (selon les statuts de l'AEn7), membres",
      args: {
        yearTiers: t.arg.intList({
          description: 'Filtrer par promotions relatives (1 = 1A, 2 = 2A...)',
        }),
      },
      async resolve({ id }, { yearTiers }) {
        return prisma.user.count({
          where: {
            ...(yearTiers.length > 0
              ? { graduationYear: { in: yearTiers.map(fromYearTier) } }
              : {}),
            contributions: {
              some: { option: { paysFor: { some: { id } } } },
            },
          },
        });
      },
    }),
    organizerMembersCount: t.int({
      description:
        "Nombre de membres des différents bureaux de l'AE (selon les statuts de l'AEn7, membres organisateurs)",
      args: {
        yearTiers: t.arg.intList({
          description: 'Filtrer par promotions relatives (1 = 1A, 2 = 2A...)',
        }),
      },
      async resolve({ id }, { yearTiers }) {
        return prisma.groupMember.count({
          where: {
            member: {
              ...(yearTiers.length > 0
                ? { graduationYear: { in: yearTiers.map(fromYearTier) } }
                : {}),
            },
            group: {
              type: 'StudentAssociationSection',
              studentAssociationId: id,
            },
          },
        });
      },
    }),
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
    services: t.relatedConnection('services', {
      cursor: 'id',
      description: 'Services proposés par une AE',
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
