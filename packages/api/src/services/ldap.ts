import ldap from 'ldapjs';
import '../context.js';
import bunyan from 'bunyan';

export interface LdapUser {
  schoolUid: string;
  schoolEmail: string;
  firstName?: string;
  lastName?: string;
}

const settings = JSON.parse(process.env.LDAP) as {
  servers: Record<
    string,
    { url: string; filterAttribute: string; wholeEmail: boolean; attributesMap: LdapUser }
  >;
  emailDomains: Record<string, string>;
};

const log = bunyan.createLogger({ name: '@centraverse/api ldap client', level: 'trace' });

/** Finds a user in a school database or returns `undefined`. */
export const findSchoolUser = async (
  email: string
): Promise<(LdapUser & { schoolServer: string }) | undefined> => {
  const [emailLogin, emailDomain] = email.split('@') as [string, string];

  if (!emailDomain) throw new Error('Invalid email address');
  console.log(emailDomain);
  const schoolServer = settings.emailDomains[emailDomain];
  console.log(schoolServer);
  if (!schoolServer || !settings.servers[schoolServer]) return;

  const { url, filterAttribute, wholeEmail, attributesMap } = settings.servers[schoolServer]!;

  const client = ldap.createClient({ url, log });

  const ldapObject = await new Promise<ldap.SearchEntryObject | undefined>((resolve, reject) => {
    // console.log(`Searching for ou=people,dc=n7,dc=fr with ${filterAttribute}=${emailLogin}${wholeEmail ? `@${emailDomain}` : ''}`);
    client.bind('cn=anonymous', '', (err) => {
      if (err) console.log(err);
    });
    client.search(
      'ou=people,dc=n7,dc=fr',
      { filter: `${filterAttribute}=${emailLogin}${wholeEmail ? `@${emailDomain}` : ''}` },
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

        results.on('searchEntry', ({ object }) => {
          console.log(object);
          resolve(object);
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
      const value = ldapObject[attributeKey];
      return [key, value ? value.toString() : undefined];
    })
  ) as unknown as LdapUser;

  return { ...user, schoolServer };
};
