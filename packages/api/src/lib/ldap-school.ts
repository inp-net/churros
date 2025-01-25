/* eslint-disable no-console */
import { fromYearTier } from '#lib';
import bunyan from 'bunyan';
import ldap from 'ldapjs';
import { ENV } from './env.js';

const logger = bunyan.createLogger({ name: 'CRI INP ldap', level: 'debug' });

export interface LdapUser {
  schoolUid: string;
  schoolEmail: string;
  firstName?: string;
  lastName?: string;
}

export const schoolLdapSettings = ENV.LDAP_SCHOOL;

function parseN7ApprenticeAndMajor(groups: string[] | undefined):
  | undefined
  | {
      major?: string | undefined;
      apprentice?: boolean;
      graduationYear?: number;
    } {
  if (!groups) return undefined;
  for (const group of groups) {
    if (group.startsWith('cn=n7etu_')) {
      const fragment = group.split(',')[0];
      if (!fragment) return undefined;
      // TODO use document obtained after DSI ticket
      const parts = /n7etu_(?<major>SN|MF2E|3EA)_(?<yearTier>\d)A(_APP)?/.exec(fragment);
      if (!parts) return;
      return {
        major: parts.groups?.['major'] as 'MF2E' | 'SN' | '3EA' | undefined,
        apprentice: fragment.includes('_APP'),
        graduationYear: fromYearTier(Number.parseInt(parts.groups?.['yearTier'] ?? '0', 10)),
      };
    }
  }

  return undefined;
}

function unaccent(str: string): string {
  return str.normalize('NFD').replaceAll(/[\u0300-\u036F]/g, '');
}

/** Finds a user in a school database or returns `undefined`. */
export const findSchoolUser = async (
  searchBy:
    | { email: string }
    | {
        firstName: string;
        lastName: string;
        graduationYear: number;
        major: { shortName: string };
        schoolServer: string;
      },
): Promise<
  | (LdapUser & {
      schoolServer: string;
      major?: string | undefined;
      graduationYear?: number;
      apprentice?: boolean;
    })
  | undefined
> => {
  if (!schoolLdapSettings) return;

  let ldapFilter = '';
  let schoolServer: string | undefined;
  console.log({ findSchoolUser: searchBy });
  if ('email' in searchBy) {
    const [emailLogin, emailDomain] = searchBy.email.split('@') as [string, string];

    if (!emailDomain) throw new Error('Invalid email address');

    schoolServer = schoolLdapSettings.emailDomains[emailDomain];
    if (!schoolServer || !schoolLdapSettings.servers[schoolServer]) return;
    console.log({ schoolServer });
    const { filterAttribute, wholeEmail } = schoolLdapSettings.servers[schoolServer]!;
    ldapFilter = `${filterAttribute}=${emailLogin}${wholeEmail ? `@${emailDomain}` : ''}`;
  } else {
    schoolServer = searchBy.schoolServer;
    ldapFilter = `(&(sn=${unaccent(searchBy.lastName)})(givenName=${unaccent(
      searchBy.firstName,
    )}))`;
  }

  const { url, attributesMap } = schoolLdapSettings.servers[schoolServer]!;

  const client = ldap.createClient({ url, log: logger });

  const ldapObject = await new Promise<
    { groups: string[] | undefined; attrs: Record<string, string | undefined> } | undefined
  >((resolve, reject) => {
    client.bind('', '', (err) => {
      if (err) console.log(err);
    });
    client.search(
      'ou=people,dc=n7,dc=fr',
      {
        scope: 'sub',
        filter: ldapFilter,
      },
      (error, results) => {
        console.log(results);
        if (error) {
          reject(error);
          return;
        }

        results.on('connectRefused', console.log);

        results.on('connectTimeout', console.log);

        results.on('searchReference', console.log);

        results.on('searchEntry', ({ pojo }) => {
          console.log(pojo);
          const groups = pojo.attributes.find((a) => a.type === 'groups')?.values;
          const parsed = parseN7ApprenticeAndMajor(groups);

          if (!parsed) {
            console.info('ldap sync', 'continue search in school ldap', {
              why: 'could not parse groups from pojo',
              searchBy,
              groups,
              pojo,
            });
            if ('email' in searchBy) {
              console.info('ldap sync', 'bypass since searching by email', {});
              resolve({
                groups,
                attrs: Object.fromEntries(
                  pojo.attributes.map(({ type, values }) => [
                    type,
                    values.length > 0 ? values[0] : undefined,
                  ]),
                ),
              });
            }

            return;
          }

          if ('graduationYear' in searchBy && parsed.graduationYear !== searchBy.graduationYear) {
            console.info('ldap sync', 'continue search in school ldap', {
              why: 'graduation year does not match',
              searchBy,
              parsed,
              pojo,
            });
            return;
          }

          if ('major' in searchBy && parsed.major !== searchBy.major.shortName) {
            console.info('ldap sync', 'continue search in school ldap', {
              why: 'major does not match',
              searchBy,
              parsed,
              pojo,
            });
            return;
          }

          resolve({
            groups,
            attrs: Object.fromEntries(
              pojo.attributes.map(({ type, values }) => [
                type,
                values.length > 0 ? values[0] : undefined,
              ]),
            ),
          });
        });

        results.on('end', (a) => {
          console.log(a);
          // eslint-disable-next-line unicorn/no-useless-undefined
          resolve(undefined);
        });

        results.on('error', (error) => {
          reject(error);
        });
      },
    );
  });

  // Wait for the client to disconnect
  await new Promise<void>((resolve, reject) => {
    client.unbind((error) => {
      if (error) reject(error);
      else resolve();
    });
  });

  if (!ldapObject) {
    console.error(`Utilisateur introuvable.`);
    return undefined;
  }

  const user = Object.fromEntries(
    Object.keys(attributesMap).map((key) => {
      const attributeKey = attributesMap[key as keyof typeof attributesMap];
      if (!attributeKey) return [key, undefined];
      const value = ldapObject.attrs[attributeKey];
      return [key, value ? value.toString() : undefined];
    }),
  ) as unknown as LdapUser;

  const result = { ...user, schoolServer, ...parseN7ApprenticeAndMajor(ldapObject.groups) };

  return result;
};
