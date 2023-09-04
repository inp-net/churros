/* eslint-disable complexity */

import type { Group, Major, School, User } from '@prisma/client';
import ldap from 'ldapjs';
import crypto from 'node:crypto';

const LDAP_URL = process.env.OLD_LDAP_URL || 'ldap://localhost:389';
const LDAP_BASE_DN = process.env.LDAP_BASE_DN || 'dc=example,dc=com';
const LDAP_BIND_DN = process.env.LDAP_BIND_DN || 'cn=admin,dc=example,dc=com';
const LDAP_BIND_PASSWORD = process.env.LDAP_BIND_PASSWORD || 'admin';

// Configuration de la connexion LDAP
let ldapClient: ldap.Client | undefined;

function connectLdap(): ldap.Client {
  if (ldapClient === undefined) {
    ldapClient = ldap.createClient({
      url: LDAP_URL,
    });
  }

  return ldapClient;
}

/* interface LdapSchool {
  objectClass: string[];
  o: string;
  displayName: string;
}

interface LdapFiliere {
  objectClass: string[];
  displayName: string;
  ecole: string;
  inactif: boolean;
  ou: string;
  shortName: string;
}

interface LdapAlias {
  objectClass: string[];
  cn: string;
  rfc822MailMember: string[];
} */

interface LdapUser {
  objectClass: string[];
  uid: string;
  uidNumber: number;
  gidNumber: number;
  birthDate?: string;
  cn: string;
  displayName?: string;
  ecole: string;
  mail: string;
  filiere: string;
  genre: number;
  givenName?: string;
  givenNameSearch?: string;
  hasWebsite?: boolean;
  homeDirectory: string;
  inscritAE: boolean;
  inscritFrappe?: boolean;
  inscritPassVieEtudiant?: boolean;
  loginShell: string;
  loginTP?: string;
  mailAnnexe?: string[];
  mailEcole?: string;
  mailForwardingAddress?: string[];
  mobile?: string[];
  userPassword: string[];
  promo: number;
  sn: string;
  snSearch?: string;
  uidParrain?: string[];
}

/* interface LdapGroup {
  objectClass: string[];
  cn: string;
  displayName: string;
  gidNumber: number;
  hasWebsite: boolean;
  memberUid: string[];
}

interface LdabClub extends LdapGroup {
  activite: string;
  anneePassation: number;
  ecole: string;
  local: string[];
  mailAlias: string[];
  president: string;
  secretaire: string[];
  tresorier: string;
  vicePresident: string[];
  typeClub?: string;
} */

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(4);
  const sha_hash = crypto.createHash('sha1');
  sha_hash.update(Buffer.from(password, 'utf8'));
  sha_hash.update(salt);
  return `{SSHA}${Buffer.concat([sha_hash.digest(), salt]).toString('base64')}`;
}

// check if a user exists in LDAP and return true if it does
async function checkLdapUserByUidNumber(uidNumber: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const searchOptions: ldap.SearchOptions = {
      scope: 'sub', // Search scope (subtree)
      filter: `(uidNumber=${uidNumber})`, // Filter to search for the user by username
    };

    connectLdap().search(LDAP_BASE_DN, searchOptions, (error, searchResult) => {
      if (error) {
        reject(error);
        return;
      }

      searchResult.on('searchEntry', (entry) => {
        // If the user is found, return true
        if (entry.pojo) resolve(true);
      });

      // Return false if the user is not found
      searchResult.on('end', () => {
        resolve(false);
      });
    });
  });
}

async function findFreeUidNumber(min = 2000, max = 60_000): Promise<number | undefined> {
  if (max > 60_000) throw new Error('max uidNumber is 60000');

  const avgUidNumber = (min + max) / 2;
  const exist = await checkLdapUserByUidNumber(avgUidNumber);
  if (min === max) {
    if (exist) return undefined;

    return avgUidNumber;
  }

  if (exist) return findFreeUidNumber(avgUidNumber + 1, max);

  return findFreeUidNumber(min, avgUidNumber);
}

async function queryLdapUser(username: string): Promise<LdapUser | null> {
  return new Promise((resolve, reject) => {
    const searchOptions: ldap.SearchOptions = {
      scope: 'sub', // Search scope (subtree)
      filter: `(uid=${username})`, // Filter to search for the user by username
    };

    connectLdap().bind(LDAP_BIND_DN, LDAP_BIND_PASSWORD, (bindError) => {
      if (bindError) {
        console.error('LDAP Bind Error:', bindError);
        // Handle the bind error
      } else {
        // Perform the search after successful bind
        connectLdap().search(LDAP_BASE_DN, searchOptions, (error, searchResult) => {
          if (error) {
            reject(error);
            return;
          }

          let user: LdapUser;

          searchResult.on('searchEntry', (entry) => {
            // If the user is found, create a user object
            if (entry.pojo) {
              user = {
                objectClass: [],
                uid: '',
                uidNumber: 0,
                gidNumber: 0,
                cn: '',
                ecole: '',
                mail: '',
                filiere: '',
                genre: 0,
                homeDirectory: '',
                inscritAE: false,
                loginShell: '',
                userPassword: [],
                promo: 0,
                sn: '',
              };
              for (const attribute of entry.pojo.attributes) {
                switch (attribute.type) {
                  case 'uid': {
                    user.uid = attribute.values[0]!;
                    break;
                  }

                  case 'uidNumber': {
                    user.uidNumber = Number.parseInt(attribute.values[0]!, 10);
                    break;
                  }

                  case 'gidNumber': {
                    user.gidNumber = Number.parseInt(attribute.values[0]!, 10);
                    break;
                  }

                  case 'birthDate': {
                    user.birthDate = attribute.values[0];
                    break;
                  }

                  case 'cn': {
                    user.cn = attribute.values[0]!;
                    break;
                  }

                  case 'displayName': {
                    user.displayName = attribute.values[0]!;
                    break;
                  }

                  case 'ecole': {
                    user.ecole = attribute.values[0]!;
                    break;
                  }

                  case 'mail': {
                    user.mail = attribute.values[0]!;
                    break;
                  }

                  case 'filiere': {
                    user.filiere = attribute.values[0]!;
                    break;
                  }

                  case 'genre': {
                    user.genre = Number.parseInt(attribute.values[0]!, 10);
                    break;
                  }

                  case 'givenName': {
                    user.givenName = attribute.values[0];
                    break;
                  }

                  case 'givenNameSearch': {
                    user.givenNameSearch = attribute.values[0];
                    break;
                  }

                  case 'hasWebsite': {
                    user.hasWebsite = attribute.values[0] === 'TRUE';
                    break;
                  }

                  case 'homeDirectory': {
                    user.homeDirectory = attribute.values[0]!;
                    break;
                  }

                  case 'inscritAE': {
                    user.inscritAE = attribute.values[0] === 'TRUE';
                    break;
                  }

                  case 'inscritFrappe': {
                    user.inscritFrappe = attribute.values[0] === 'TRUE';
                    break;
                  }

                  case 'inscritPassVieEtudiant': {
                    user.inscritPassVieEtudiant = attribute.values[0] === 'TRUE';
                    break;
                  }

                  case 'loginShell': {
                    user.loginShell = attribute.values[0]!;
                    break;
                  }

                  case 'loginTP': {
                    user.loginTP = attribute.values[0];
                    break;
                  }

                  case 'mailAnnexe': {
                    user.mailAnnexe = attribute.values;
                    break;
                  }

                  case 'mailEcole': {
                    user.mailEcole = attribute.values[0];
                    break;
                  }

                  case 'mailForwardingAddress': {
                    user.mailForwardingAddress = attribute.values;
                    break;
                  }

                  case 'mobile': {
                    user.mobile = attribute.values;
                    break;
                  }

                  case 'userPassword': {
                    user.userPassword = attribute.values;
                    break;
                  }

                  case 'promo': {
                    user.promo = Number.parseInt(attribute.values[0]!, 10);
                    break;
                  }

                  case 'sn': {
                    user.sn = attribute.values[0]!;
                    break;
                  }

                  case 'snSearch': {
                    user.snSearch = attribute.values[0];
                    break;
                  }

                  case 'uidParrain': {
                    user.uidParrain = attribute.values;
                    break;
                  }

                  default: {
                    break;
                  }
                }
              }
            }
          });

          // Return the user object
          searchResult.on('end', () => {
            resolve(user);
          });
        });
      }
    });
  });
}

// create a new user in LDAP
async function createLdapUser(
  user: User & {
    major?: undefined | null | (Major & { ldapSchool?: School | undefined | null });
    godparent?: User | null;
  },
  password: string
): Promise<void> {
  const userDn = `uid=${user.uid},ou=people,o=n7,${LDAP_BASE_DN}`;
  const uidNumber = await findFreeUidNumber();
  if (!uidNumber) throw new Error('No free uidNumber');

  if (!user.major?.ldapSchool) throw new Error('No major or school');

  const userAttributes = {
    objectClass: [
      'top',
      'person',
      'organizationalPerson',
      'inetOrgPerson',
      'qmailUser',
      'posixAccount',
      'shadowAccount',
      'Eleve',
    ],
    uidNumber,
    gidNumber: 1000,
    birthdate: user.birthday?.toISOString().split('T')[0] ?? '',
    cn: `${user.firstName} ${user.lastName}`,
    displayName: `${user.firstName} ${user.lastName}`,
    ecole: `o=${user.major.ldapSchool.uid},${LDAP_BASE_DN}`,

    mail: `${user.uid}@${user.major.ldapSchool.internalMailDomain}`,

    filiere: `ou=${user.major.uid},ou=filieres,o=${user.major.ldapSchool.uid},${LDAP_BASE_DN}`,
    genre: 404,
    givenName: user.firstName,
    givenNameSearch: user.firstName.toLowerCase(),
    hasWebsite: 'FALSE',
    homeDirectory: `/home/${user.uid}`,
    inscritAE: 'FALSE',
    inscritFrappe: 'FALSE',
    inscritPassVieEtudiant: 'FALSE',
    loginShell: '/bin/bash',
    loginTP: user.schoolUid,
    mailEcole: user.schoolEmail,
    mailForwardingAddress: user.email,
    mobile: user.phone.toString(),
    userPassword: hashPassword(password),
    promo: user.graduationYear.toString(),
    sn: user.lastName,
    snSearch: user.lastName.toLowerCase(),
  };

  console.info(`Attributes ${JSON.stringify(userAttributes, undefined, 2)}} for ${userDn}`);
  const userAttributesStringable = Object.fromEntries(
    Object.entries(userAttributes).filter(([_, v]) => v !== null && v !== '')
  ) as Partial<typeof userAttributes>;

  console.info(
    `The following attrs are not stringable and were stripped from the request: ${JSON.stringify(
      Object.fromEntries(
        Object.entries(userAttributes).filter(
          ([k, _]) => !Object.keys(userAttributesStringable).includes(k)
        )
      ),
      undefined,
      2
    )}`
  );

  console.info(
    `Sending LDAP add request for ${userDn} with attributes: ${JSON.stringify(
      userAttributesStringable
    )}`
  );

  console.info(userAttributesStringable);

  connectLdap().bind(LDAP_BIND_DN, LDAP_BIND_PASSWORD, (bindError) => {
    if (bindError) {
      console.error('LDAP Bind Error:', bindError);
      // Handle the bind error
    } else {
      connectLdap().add(userDn, userAttributesStringable, (error) => {
        console.error('LDAP Add Error:', error);
      });
    }
  });
}

async function resetLdapUserPassword(
  user: User & { major?: undefined | (Major & { ldapSchool?: School | undefined }) },
  password: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (user.major === undefined || user.major.ldapSchool === undefined) {
      reject(new Error('No major or school'));
      return;
    }

    const userDn = `uid=${user.uid},ou=people,o=${user.major.ldapSchool.uid},${LDAP_BASE_DN}`;
    const userChange = new ldap.Change({
      operation: 'replace',
      modification: {
        userPassword: hashPassword(password),
      },
    });

    connectLdap().bind(LDAP_BIND_DN, LDAP_BIND_PASSWORD, (bindError) => {
      if (bindError) {
        console.error('LDAP Bind Error:', bindError);
        // Handle the bind error
      } else {
        connectLdap().modify(userDn, userChange, (error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }
    });
  });
}

async function createLdapGroup(group: Group): Promise<void> {
  return new Promise((resolve, reject) => {
    const groupDn = `cn=${group.uid},ou=grp-informels,ou=groups,o=n7,${LDAP_BASE_DN}`;
    const groupAttributes = {
      objectClass: ['top', 'posixGroup', 'Groupe'],
      displayName: group.name,
      gidNumber: '',
      hasWebsite: 'FALSE',
      memberUid: [],
    };

    connectLdap().bind(LDAP_BIND_DN, LDAP_BIND_PASSWORD, (bindError) => {
      if (bindError) {
        console.error('LDAP Bind Error:', bindError);
        // Handle the bind error
      } else {
        connectLdap().add(groupDn, groupAttributes, (error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }
    });
  });
}

export { queryLdapUser, createLdapUser, resetLdapUserPassword, createLdapGroup };
