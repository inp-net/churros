import { builder, prisma } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { canEditGroupMembers } from '#modules/groups/utils';
import { onBoard } from '#permissions';
// TODO maybe rename membership ?

export const GroupMemberType = builder.prismaObject('GroupMember', {
  fields: (t) => ({
    memberId: t.exposeID('memberId'),
    groupId: t.exposeID('groupId'),
    title: t.string({ resolve: ({ title }) => title || 'Membre' }),
    president: t.exposeBoolean('president'),
    treasurer: t.exposeBoolean('treasurer'),
    vicePresident: t.exposeBoolean('vicePresident'),
    secretary: t.exposeBoolean('secretary'),
    canBeEdited: t.boolean({
      description: 'On a le droit de modifier ce membre',
      async resolve({ groupId }, _, { user }) {
        const group = await prisma.group.findUniqueOrThrow({
          where: { id: groupId },
          include: canEditGroupMembers.prismaIncludes,
        });
        return canEditGroupMembers(user, group);
      },
    }),
    canEditMembers: t.boolean({
      resolve({ canEditMembers, ...roles }) {
        return onBoard(roles) || canEditMembers;
      },
    }),
    canEditArticles: t.boolean({
      resolve({ canEditArticles, ...roles }) {
        return onBoard(roles) || canEditArticles;
      },
    }),
    canScanEvents: t.boolean({
      resolve({ canScanEvents, ...roles }) {
        return onBoard(roles) || canScanEvents;
      },
    }),
    onBoard: t.boolean({
      resolve({ ...roles }) {
        return onBoard(roles);
      },
    }),
    roleEmojis: t.string({
      description: 'Les emojis correspondant aux rôles du membre',
      resolve({ president, treasurer, vicePresident, secretary }) {
        let out = '';
        if (president) out += '👑';
        if (treasurer) out += '💰';
        if (vicePresident) out += '🌟';
        if (secretary) out += '📝';
        return out;
      },
    }),
    isDeveloper: t.exposeBoolean('isDeveloper'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    member: t.relation('member', { deprecationReason: 'Utiliser `user`' }),
    user: t.relation('member'),
    group: t.relation('group'),
  }),
});
