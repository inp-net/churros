/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-unused-vars */
 
import type { User } from '@prisma/client';
import ldap from 'ldapjs';

const LDAP_URL = process.env['LDAP_URL'] || 'ldap://localhost:389';
const LDAP_BASE_DN = process.env['LDAP_BASE_DN'] || 'dc=example,dc=com';
const LDAP_BIND_DN = process.env['LDAP_BIND_DN'] || 'cn=admin,dc=example,dc=com';
const LDAP_BIND_PASSWORD = process.env['LDAP_BIND_PASSWORD'] || 'admin';

// Configuration de la connexion LDAP
const ldapClient = ldap.createClient({
  url: LDAP_URL,
});

interface LdapSchool {
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
}

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

interface LdapGroup {
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
}

function hashPassword(password: string): string {
  return password;
}

async function queryLdapUser(username: string): Promise<LdapUser | null> {
  return new Promise((resolve, reject) => {
    const searchOptions: ldap.SearchOptions = {
      scope: 'sub', // Search scope (subtree)
      filter: `(uid=${username})`, // Filter to search for the user by username
    };

    ldapClient.bind(LDAP_BIND_DN, LDAP_BIND_PASSWORD, (bindError) => {
      if (bindError) {
        console.error('LDAP Bind Error:', bindError);
        // Handle the bind error
      } else {
        // Perform the search after successful bind
        ldapClient.search(LDAP_BASE_DN, searchOptions, (error, searchResult) => {
          if (error) {
            reject(error);
            return;
          }

          let user: LdapUser;

          searchResult.on('searchEntry', (entry) => {
            // If the user is found, create a user object
            if (entry.pojo.messageID) {
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
async function createLdapUser(user: User, password: string, loginTP: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const userDn = `uid=${user.uid},ou=people,o=n7,${LDAP_BASE_DN}`;
    const filiere = user.majorId.shotName;
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
      uid: user.uid,
      cn: `${user.firstName} ${user.lastName}`,
      displayName: `${user.firstName} ${user.lastName}`,
      ecole: `o=n7,${LDAP_BASE_DN}`,
      mail: `${user.uid}@bde.enseeiht.fr`,
      filiere: `${filiere},ou=filieres,o=n7,${LDAP_BASE_DN}`,
      genre: 404,
      givenName: user.firstName,
      givenNameSearch: user.firstName.toLowerCase(),
      hasWebsite: false,
      homeDirectory: `/home/${user.uid}`,
      inscritAE: false,
      inscritFrappe: false,
      inscritPassVieEtudiant: false,
      loginShell: '/bin/bash',
      loginTP,
      mailAnnexe: user.otherEmails,
      mailEcole: user.schoolEmail,
      mailForwardingAddress: user.email,
      mobile: user.phone,
      userPassword: hashPassword(password),
      promo: user.graduationYear,
      sn: user.lastName,
      snSearch: user.lastName.toLowerCase(),
      uidParrain: user.godparent?.uid,
    };

    ldapClient.bind(LDAP_BIND_DN, LDAP_BIND_PASSWORD, (bindError) => {
        if (bindError) {
            console.error('LDAP Bind Error:', bindError);
            // Handle the bind error
        } else {
            ldapClient.add(userDn, userAttributes, (error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
            });
        }
        }
    );
  });
}

export { queryLdapUser, createLdapUser };
