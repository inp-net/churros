import '../context.js';
import ldap from 'ldapjs';

const settings = JSON.parse(process.env.LDAP) as {
  servers: Record<
    string,
    {
      url: string;
      filterAttribute: string;
      wholeEmail: boolean;
      attributesMap: {
        firstName?: string;
        lastName?: string;
        email?: string;
      };
    }
  >;
  emailDomains: Record<string, string>;
};

const findLdapUser = async (email: string) => {
  const [emailLogin, emailDomain] = email.split('@') as [string, string];

  if (!emailDomain) throw new Error('Invalid email address');
  const server = settings.emailDomains[emailDomain];
  if (!server || !settings.servers[server]) throw new Error('Invalid email address');

  const { url, filterAttribute, wholeEmail, attributesMap } = settings.servers[server]!;

  const client = ldap.createClient({ url });

  const ldapObject = await new Promise<ldap.SearchEntryObject>((resolve, reject) => {
    client.search(
      'ou=people,dc=n7,dc=fr',
      { filter: `${filterAttribute}=${emailLogin}${wholeEmail ? `@${emailDomain}` : ''}` },
      (error, results) => {
        if (error) {
          reject(error);
          return;
        }

        results.on('searchEntry', ({ object }) => {
          resolve(object);
        });

        results.on('end', () => {
          reject(new Error('User not found'));
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

  const user = Object.fromEntries(
    Object.keys(attributesMap).map((key) => {
      const attributeKey = attributesMap[key as keyof typeof attributesMap];
      if (!attributeKey) return [key, undefined];
      const value = ldapObject[attributeKey];
      return [key, value ? value.toString() : undefined];
    })
  ) as { [key in keyof typeof attributesMap]: string | undefined };

  return user;
};

if (!process.argv[2]) throw new Error('Missing email address');

console.log(await findLdapUser(process.argv[2]));
