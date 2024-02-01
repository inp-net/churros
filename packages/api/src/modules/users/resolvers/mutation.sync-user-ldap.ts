import { builder, markAsContributor, prisma, queryLdapUser } from '#lib';

import { log } from '../../../lib/logger.js';
import { createUid } from '../index.js';
// TODO rename to sync-user-with-ldap
// maybe make a LDAP module

builder.mutationField('syncUserLdap', (t) =>
  t.boolean({
    args: {
      uid: t.arg.string(),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user?.admin);
    },
    async resolve(_, { uid }) {
      const userDb = await prisma.user.findUnique({
        where: { uid },
        include: {
          contributions: {
            include: {
              option: {
                include: {
                  paysFor: true,
                },
              },
            },
          },
        },
      });
      if (!userDb) return false;
      const userLdap = await queryLdapUser(userDb.uid);
      if (!userLdap) return false;

      if (userDb.graduationYear !== userLdap.promo && userLdap.genre !== 404) {
        const newUid = await createUid(userDb);
        await prisma.user.update({
          where: { uid: userDb.uid },
          data: { uid: newUid },
        });
        console.info(`Updated uid: ${uid} -> ${newUid}`);
      }

      const { uid: finalUid } = await prisma.user.findUniqueOrThrow({ where: { id: userDb.id } });
      if (
        userDb.contributions.some(({ option: { paysFor } }) =>
          paysFor.some(({ name }) => name === 'AEn7'),
        )
      ) {
        try {
          await markAsContributor(finalUid);
        } catch (error: unknown) {
          await log('ldap-sync', 'mark as contributor', { err: error }, finalUid);
        }
      }

      return true;
    },
  }),
);
