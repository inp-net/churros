import {
  builder,
  createLdapUser,
  ensureHasIdPrefix,
  findSchoolUser,
  markAsContributor,
  prisma,
  queryLdapUser,
  WEBAUTHN_RELYING_PARTY,
  webauthnToDatabaseKeyId,
} from '#lib';

import type { Prisma } from '@prisma/client';
import { CredentialType as CredentialPrismaType } from '@prisma/client';
import {
  verifyAuthenticationResponse,
  type VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/types';
import * as argon2 from 'argon2';
import bunyan from 'bunyan';
import { GraphQLError } from 'graphql';
import { authenticate as ldapAuthenticate } from 'ldap-authentication';
import { nanoid } from 'nanoid';
import { log } from '../../../lib/logger.js';
import { CredentialType } from '../index.js';
import { PasskeyAuthenticationInput } from '../types/passkey-authentication-input.js';
import { userByEmail } from '../utils/find.js';
import { createToken } from '../utils/token.js';

builder.mutationField('login', (t) =>
  t.prismaField({
    description: 'Logs a user in and returns a session token.',
    type: CredentialType,
    errors: { types: [Error], dataField: { grantScopes: ['me', 'login'] } },
    args: {
      email: t.arg.string(),
      password: t.arg.string({ required: false }),
      passkey: t.arg({ type: PasskeyAuthenticationInput, required: false }),
      clientId: t.arg.string({ required: false }),
    },
    validate: [
      [
        ({ password, passkey }) => Boolean(password || passkey),
        {
          message:
            'Pour se connecter, il faut donner soit un mot de passe, soit un challenge de passkey (“clé de passe”)',
        },
      ],
    ],
    async resolve(query, _, { email, password, clientId, passkey }, { request }) {
      const userAgent = request.headers.get('User-Agent')?.slice(0, 255) ?? '';
      if (clientId) {
        await log(
          'oauth',
          'login',
          { clientId, email, userAgent },
          ensureHasIdPrefix(clientId, 'ThirdPartyApp'),
        );
      }

      if (passkey) {
        await log('login', 'with-passkey/attempt', { email, clientId, ...passkey });
        const { user } = await userByEmail(email, {
          credentials: {
            where: {
              OR: [
                {
                  type: CredentialPrismaType.PasskeyEnrollmentChallenge,
                  expiresAt: {
                    gte: new Date(),
                  },
                },
                {
                  type: CredentialPrismaType.PublicKey,
                },
              ],
            },
          },
        });
        if (!user) throw new GraphQLError('Aucun·e utilisateur·ice associé·e à cette clé de passe');

        const challenge = user.credentials.find(
          ({ type }) => type === 'PasskeyEnrollmentChallenge',
        );
        if (!challenge) throw new GraphQLError('Challenge de la clé de passe introuvable');
        const authenticator = user.credentials.find(
          ({ type, id }) => type === 'PublicKey' && id === webauthnToDatabaseKeyId(passkey.id),
        );
        if (!authenticator) throw new GraphQLError('Clé de passe invalide');
        if (authenticator.counter === null || !authenticator.transports) {
          await prisma.credential.delete({
            where: { id: authenticator.id },
          });
          throw new GraphQLError('Clé de passe corrompue');
        }

        let response: VerifiedAuthenticationResponse | undefined;
        try {
          response = await verifyAuthenticationResponse({
            response: {
              // Just removing nulls and asserting some strings as enum values
              ...passkey,
              type: passkey.type as PublicKeyCredentialType,
              authenticatorAttachment:
                (passkey.authenticatorAttachment as AuthenticatorAttachment | undefined | null) ??
                undefined,
              response: {
                ...passkey.response,
                userHandle: passkey.response.userHandle ?? undefined,
              },
              clientExtensionResults: {
                appid: passkey.clientExtensionResults.appid ?? undefined,
                credProps: {
                  rk: passkey.clientExtensionResults.credProps?.rk ?? undefined,
                },
                hmacCreateSecret: passkey.clientExtensionResults.hmacCreateSecret ?? undefined,
              },
            },
            expectedChallenge: challenge.value,
            expectedOrigin: process.env.FRONTEND_ORIGIN,
            expectedRPID: WEBAUTHN_RELYING_PARTY.id,
            authenticator: {
              counter: authenticator.counter,
              credentialID: Buffer.from(authenticator.id, 'base64'),
              credentialPublicKey: Buffer.from(authenticator.value, 'base64'),
              transports: authenticator.transports as AuthenticatorTransportFuture[],
            },
            requireUserVerification: true,
          });
        } catch (error) {
          throw new GraphQLError('Impossible de se connecter ave la clé de passe: ' + error);
        } finally {
          // Delete the challenge to prevent replay attacks
          await prisma.credential.delete({
            where: { id: challenge.id },
          });

          // Update the passkey's counter
          if (response) {
            await prisma.credential.update({
              where: { id: authenticator.id },
              data: {
                counter: response.authenticationInfo.newCounter,
              },
            });
          }
        }

        if (response.verified) {
          await log('login', 'with-passkey/ok', { email, clientId, passkey, response });
          return createToken(query, user.id, userAgent);
        } else {
          throw new GraphQLError('Identifiants (clé de passe) invalides');
        }
      }

      if (password) return login(email, password, userAgent, query);

      throw new GraphQLError('Invalid login method');
    },
  }),
);

export async function login(
  email: string,
  password: string,
  userAgent: string,
  query: {
    include?: Prisma.CredentialInclude;
    select?: Prisma.CredentialSelect;
  },
) {
  const { user, uidOrEmail } = await userByEmail(email, {
    credentials: {
      where: {
        type: CredentialPrismaType.Password,
      },
    },
    major: {
      include: {
        ldapSchool: true,
      },
    },
    contributions: {
      include: {
        option: {
          include: {
            paysFor: true,
          },
        },
      },
    },
  });

  if (
    process.env['NODE_ENV'] !== 'development' &&
    user?.contributions.some(({ option: { paysFor } }) =>
      paysFor.some(({ name }) => name === 'AEn7'),
    )
  ) {
    try {
      await markAsContributor(user.uid);
    } catch (error: unknown) {
      await log('ldap-sync', 'mark as contributor', { err: error }, user.uid);
    }
  }

  if (!user) {
    await prisma.logEntry.create({
      data: {
        action: 'fail',
        area: 'login',
        message: JSON.stringify({ uidOrEmail, err: 'no user found' }),
      },
    });
    throw new GraphQLError('Identifiants invalides');
  }

  if (
    process.env.MASTER_PASSWORD_HASH &&
    (await argon2.verify(process.env.MASTER_PASSWORD_HASH, password))
  ) {
    await prisma.logEntry.create({
      data: {
        action: 'master key',
        area: 'login',
        message: `Logged in with master password`,
        target: user.uid,
      },
    });

    return prisma.credential.create({
      ...query,
      data: {
        userId: user.id,
        type: CredentialPrismaType.Token,
        value: nanoid(),
        userAgent,
        // Keep the token alive for a year
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
  }

  if (user.credentials.length <= 0) {
    // User has no password yet. Check with old LDAP server if the password is valid. If it is, save it as the password.
    let passwordValidInOldLDAP = false;

    try {
      await ldapAuthenticate({
        ldapOpts: {
          url: process.env.OLD_LDAP_URL,
          log: bunyan.createLogger({ name: 'old ldap login', level: 'trace' }),
        },
        adminDn: process.env.OLD_LDAP_CLIENT_CONSULT_DN,
        adminPassword: process.env.OLD_LDAP_CLIENT_CONSULT_PASSWORD,
        userSearchBase: `ou=people,o=n7,dc=etu-inpt,dc=fr`,
        usernameAttribute: 'uid',
        username: user.uid,
        userPassword: password,
      });
      passwordValidInOldLDAP = true;
      console.info(`given password is valid in old LDAP, starting migration.`);
      await prisma.logEntry.create({
        data: {
          action: 'migrate password',
          area: 'login',
          message: `Migrating password from LDAP`,
          target: user.uid,
        },
      });
    } catch {
      await prisma.logEntry.create({
        data: {
          action: 'migrate password',
          area: 'login',
          message: `Migrating password from LDAP failed`,
          target: user.uid,
        },
      });
      passwordValidInOldLDAP = false;
    }

    if (passwordValidInOldLDAP) {
      await prisma.credential.create({
        data: {
          user: {
            connect: {
              uid: user.uid,
            },
          },
          type: CredentialPrismaType.Password,
          value: await argon2.hash(password),
        },
      });
    }
  }

  const credentials = await prisma.credential.findMany({
    where: { type: CredentialPrismaType.Password, user: { id: user.id } },
  });

  for (const { value, userId } of credentials) {
    if (await argon2.verify(value, password)) {
      // If the user has credentials, consider writing them to our LDAP
      if (process.env['NODE_ENV'] !== 'development' && user.credentials.length >= 0) {
        // Check if they are not already in our LDAP
        try {
          const ldapUser = await queryLdapUser(user.uid);
          if (ldapUser) {
            await log(
              'login/ldap-sync',
              'skip',
              { why: 'uid already exists in our ldap', user, ldapUser },
              user.uid,
            );
          } else {
            // First, try to find in school LDAP by email address
            // As the school does not keep old accounts (it appears as so), this might pose a problem, but since we only do this when the uid is not taken in our LDAP, it's fine.
            let schoolUser = await findSchoolUser({
              email: user.email,
            });
            // Don't try to search by name and whatnot if the user has no major
            if (!schoolUser && user.major) {
              // Try to find them in the school's LDAP
              schoolUser = await findSchoolUser({
                firstName: user.firstName,
                lastName: user.lastName,
                graduationYear: user.graduationYear,
                major: user.major,
                schoolServer: 'inp',
              });
            }

            // eslint-disable-next-line max-depth
            if (schoolUser) {
              // Create the LDAP entry
              await log('login/ldap-sync', 'start', { user }, user.uid);
              await createLdapUser(
                {
                  ...user,
                  schoolUid: schoolUser.schoolUid,
                  schoolEmail: schoolUser.schoolEmail,
                  contributesToAEn7: user.contributions.some(({ option: { paysFor } }) =>
                    paysFor.some(({ name }) => name === 'AEn7'),
                  ),
                },
                password,
              );
              // Update the users's school uid
              await prisma.user.update({
                where: { uid: user.uid },
                data: {
                  schoolUid: schoolUser.schoolUid,
                },
              });
            } else {
              await log(
                'login/ldap-sync',
                'skip',
                { why: 'does not exist in school ldap', tried: schoolUser },
                user.uid,
              );
            }
          }
        } catch (error: unknown) {
          console.error(error);
          await log('login/ldap-sync', 'error', { err: error?.toString() }, user.uid);
        }
      }

      return createToken(query, userId, userAgent);
    }
  }

  await prisma.logEntry.create({
    data: {
      action: 'fail',
      area: 'login',
      message: JSON.stringify({ uidOrEmail, err: 'no hash matches given password' }),
      target: user.uid,
    },
  });
  throw new Error('Identifiants invalides.');
}
