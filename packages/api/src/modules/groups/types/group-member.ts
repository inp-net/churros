import { builder } from '#lib';
import { DateTimeScalar } from '#modules/global';
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
    isDeveloper: t.exposeBoolean('isDeveloper'),
    onBoard: t.boolean({
      description:
        'Vrai si la personne est membre du bureau (`president`, `treasurer`, `vicePresident` ou `secretary`) du club',
      resolve({ ...roles }) {
        return onBoard(roles);
      },
    }),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    member: t.relation('member'),
    group: t.relation('group'),
    emoji: t.string({
      description:
        "Un petit emoji utilisable dans l'interface pour représenter le rôle de la personne dans le groupe.",
      resolve({ president, treasurer, vicePresident, secretary, isDeveloper }) {
        if (president) return '👑';
        if (treasurer) return '💰';
        if (vicePresident) return '🌟';
        if (secretary) return '📜';
        if (isDeveloper) return '💻';
        return '';
      },
    }),
  }),
});
