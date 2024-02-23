import { builder, prisma, removeIdPrefix } from '#lib';
import { userIsOnBoardOf } from '../../../permissions/member.js';
import { CLIENT_SECRET_LENGTH } from '../index.js';

export const ThirdPartyApp = builder.prismaObject('ThirdPartyApp', {
  description: 'A third-party OAuth2 client',
  fields: (t) => ({
    id: t.exposeID('id'),
    clientId: t.string({
      resolve({ id }) {
        return removeIdPrefix(id);
      },
    }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: true }),
    name: t.exposeString('name'),
    secretLength: t.int({
      resolve() {
        return CLIENT_SECRET_LENGTH;
      },
    }),
    usersCount: t.relationCount('users'),
    users: t.relatedConnection('users', {
      async authScopes({ ownerId }, _, { user }) {
        const group = await prisma.group.findUnique({ where: { id: ownerId } });
        return Boolean(user?.admin || (group && userIsOnBoardOf(user, group.uid)));
      },
      cursor: 'id',
      totalCount: true,
    }),
    description: t.exposeString('description'),
    website: t.exposeString('website'),
    active: t.exposeBoolean('active'),

    allowedRedirectUris: t.exposeStringList('allowedRedirectUris'),
    owner: t.relation('owner'),
  }),
});
