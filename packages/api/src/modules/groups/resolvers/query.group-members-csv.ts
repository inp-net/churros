import { builder, prisma } from '#lib';

// TODO rename to group.members-csv

builder.queryField('groupMembersCsv', (t) =>
  t.field({
    type: 'String',
    errors: {},
    args: {
      groupUid: t.arg.string(),
    },
    authScopes: (_, { groupUid }, { user }) =>
      Boolean(
        user?.canEditGroups ||
          user?.groups.some(
            ({ group, canEditMembers }) => canEditMembers && group.uid === groupUid,
          ),
      ),
    async resolve(_query, { groupUid }) {
      const group = await prisma.group.findUniqueOrThrow({
        where: { uid: groupUid },
        include: { studentAssociation: true },
      });
      const members = await prisma.groupMember.findMany({
        where: { group: { uid: groupUid } },
        include: {
          member: {
            include: {
              major: true,
              contributions: { include: { option: { include: { paysFor: true } } } },
            },
          },
        },
      });
      const humanBoolean = (b: boolean) => (b ? 'Oui' : 'Non');
      const columns = [
        'Date',
        'Prénom',
        'Nom',
        'Email',
        'Cotisant',
        'Filière',
        'Apprenti',
        'Promo',
      ] as const;

      const mapping = ({
        createdAt,
        member: { firstName, lastName, email, contributions, major, apprentice, graduationYear },
      }: (typeof members)[number]) =>
        ({
          Date: createdAt.toISOString(),
          Prénom: firstName,
          Nom: lastName,
          Email: email,
          Cotisant: humanBoolean(
            contributions.some(({ option: { paysFor } }) =>
              paysFor.some((ae) => ae.uid === group.studentAssociation?.uid),
            ),
          ),
          Filière: major?.shortName ?? '',
          Apprenti: humanBoolean(apprentice),
          Promo: graduationYear.toString(),
        }) satisfies Record<(typeof columns)[number], string>;

      let result = columns.join(',') + '\n';

      result += members
        .map((element) => mapping(element))
        .map((row) => columns.map((c) => row[c]).join(','))
        .join('\n');

      return result;
    },
  }),
);
