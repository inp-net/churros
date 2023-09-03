/* eslint-disable no-console */
import ldap from 'ldapjs';
import '../context.js';
import bunyan from 'bunyan';

export interface LdapUser {
  schoolUid: string;
  schoolEmail: string;
  firstName?: string;
  lastName?: string;
}

const settings = JSON.parse(process.env.LDAP_SCHOOL) as {
  servers: Record<
    string,
    { url: string; filterAttribute: string; wholeEmail: boolean; attributesMap: LdapUser }
  >;
  emailDomains: Record<string, string>;
};

const log = bunyan.createLogger({ name: 'CRI INP @centraverse/api ldap client', level: 'trace' });

function parseN7ApprenticeAndMajor(groups: string[] | undefined):
  | undefined
  | {
      promo?: 'SN' | '3EA' | 'MF2E' | undefined;
      apprentice?: boolean;
    } {
  if (!groups) return undefined;
  for (const group of groups) {
    if (group.startsWith('cn=n7etu_')) {
      const fragment = group.split(',')[0];
      if (!fragment) return undefined;
      const parts = /n7etu_(?<promo>SN|MF2E|3EA)_(\dA)(_APP)?/.exec(fragment);
      if (!parts) return;
      return {
        promo: parts.groups?.['promo'] as 'MF2E' | 'SN' | '3EA' | undefined,
        apprentice: fragment.includes('_APP'),
      };
    }
  }

  return undefined;
}

/** Finds a user in a school database or returns `undefined`. */
export const findSchoolUser = async (
  email: string
): Promise<
  | (LdapUser & {
      schoolServer: string;
      promo?: 'SN' | '3EA' | 'MF2E' | undefined;
      apprentice?: boolean;
    })
  | undefined
> => {
  const [emailLogin, emailDomain] = email.split('@') as [string, string];

  if (!emailDomain) throw new Error('Invalid email address');
  console.log(emailDomain);
  const schoolServer = settings.emailDomains[emailDomain];
  console.log(schoolServer);
  if (!schoolServer || !settings.servers[schoolServer]) return;

  const { url, filterAttribute, wholeEmail, attributesMap } = settings.servers[schoolServer]!;

  const client = ldap.createClient({ url, log });

  const ldapObject = await new Promise<
    { groups: string[] | undefined; attrs: Record<string, string | undefined> } | undefined
  >((resolve, reject) => {
    // console.log(`Searching for ou=people,dc=n7,dc=fr with ${filterAttribute}=${emailLogin}${wholeEmail ? `@${emailDomain}` : ''}`);
    client.bind('', '', (err) => {
      if (err) console.log(err);
    });
    client.search(
      'ou=people,dc=n7,dc=fr',
      {
        scope: 'sub',
        filter: `${filterAttribute}=${emailLogin}${wholeEmail ? `@${emailDomain}` : ''}`,
      },
      // {filter: `uid=elebihan`},
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
          resolve({
            groups: pojo.attributes.find((a) => a.type === 'groups')?.values,
            attrs: Object.fromEntries(
              pojo.attributes.map(({ type, values }) => [
                type,
                values.length > 0 ? values[0] : undefined,
              ])
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
      }
    );
  });

  // Wait for the client to disconnect
  await new Promise<void>((resolve, reject) => {
    client.unbind((error) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (error) reject(error);
      else resolve();
    });
  });

  if (!ldapObject) throw new Error(`Utilisateur introuvable dans le domaine ${emailDomain}.`);

  const user = Object.fromEntries(
    Object.keys(attributesMap).map((key) => {
      const attributeKey = attributesMap[key as keyof typeof attributesMap];
      if (!attributeKey) return [key, undefined];
      const value = ldapObject.attrs[attributeKey];
      return [key, value ? value.toString() : undefined];
    })
  ) as unknown as LdapUser;

  return { ...user, schoolServer, ...parseN7ApprenticeAndMajor(ldapObject.groups) };
};
