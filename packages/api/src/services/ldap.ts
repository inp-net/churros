/* eslint-disable no-console */
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

function queryLdapUser(username: string): Promise<LdapUser | null> {
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
              entry.pojo.attributes.forEach((attribute) => {
                switch (attribute.type) {
                  case 'uid':
                    user.uid = attribute.values[0] as string;
                    break;
                  case 'uidNumber':
                    user.uidNumber = parseInt(attribute.values[0] as string);
                    break;
                  case 'gidNumber':
                    user.gidNumber = parseInt(attribute.values[0] as string);
                    break;
                  case 'birthDate':
                    user.birthDate = attribute.values[0];
                    break;
                  case 'cn':
                    user.cn = attribute.values[0] as string;
                    break;
                  case 'displayName':
                    user.displayName = attribute.values[0] as string;
                    break;
                  case 'ecole':
                    user.ecole = attribute.values[0] as string;
                    break;
                  case 'mail':
                    user.mail = attribute.values[0] as string;
                    break;
                  case 'filiere':
                    user.filiere = attribute.values[0] as string;
                    break;
                  case 'genre':
                    user.genre = parseInt(attribute.values[0] as string, 404);
                    break;
                  case 'givenName':
                    user.givenName = attribute.values[0];
                    break;
                  case 'givenNameSearch':
                    user.givenNameSearch = attribute.values[0];
                    break;
                  case 'hasWebsite':
                    user.hasWebsite = attribute.values[0] === 'TRUE';
                    break;
                  case 'homeDirectory':
                    user.homeDirectory = attribute.values[0] as string;
                    break;
                  case 'inscritAE':
                    user.inscritAE = attribute.values[0] === 'TRUE';
                    break;
                  case 'inscritFrappe':
                    user.inscritFrappe = attribute.values[0] === 'TRUE';
                    break;
                  case 'inscritPassVieEtudiant':
                    user.inscritPassVieEtudiant = attribute.values[0] === 'TRUE';
                    break;
                  case 'loginShell':
                    user.loginShell = attribute.values[0] as string;
                    break;
                  case 'loginTP':
                    user.loginTP = attribute.values[0];
                    break;
                  case 'mailAnnexe':
                    user.mailAnnexe = attribute.values;
                    break;
                  case 'mailEcole':
                    user.mailEcole = attribute.values[0];
                    break;
                  case 'mailForwardingAddress':
                    user.mailForwardingAddress = attribute.values;
                    break;
                  case 'mobile':
                    user.mobile = attribute.values;
                    break;
                  case 'userPassword':
                    user.userPassword = attribute.values;
                    break;
                  case 'promo':
                    user.promo = parseInt(attribute.values[0] as string);
                    break;
                  case 'sn':
                    user.sn = attribute.values[0] as string;
                    break;
                  case 'snSearch':
                    user.snSearch = attribute.values[0];
                    break;
                  case 'uidParrain':
                    user.uidParrain = attribute.values;
                    break;
                  default:
                    break;
                }
              });
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
function createLdapUser(user: User): Promise<void> {
  return new Promise((resolve, reject) => {
    const userDn = `uid=${user.uid},ou=people,${LDAP_BASE_DN}`;
    const userAttributes = {
      objectClass: [
        'top',
        'person',
        'organizationalPerson',
        'inetOrgPerson',
        'posixAccount',
        'shadowAccount',
        'aePerson',
      ],
      uid: user.uid,
      cn: user.cn,
      displayName: user.displayName,
      ecole: user.ecole,
      mail: user.mail,
      filiere: user.filiere,
      genre: user.genre,
      givenName: user.givenName,
      givenNameSearch: user.givenNameSearch,
      hasWebsite: user.hasWebsite,
      homeDirectory: user.homeDirectory,
      inscritAE: user.inscritAE,
      inscritFrappe: user.inscritFrappe,
      inscritPassVieEtudiant: user.inscritPassVieEtudiant,
      loginShell: user.loginShell,
      loginTP: user.loginTP,
      mailAnnexe: user.mailAnnexe,
      mailEcole: user.mailEcole,
      mailForwardingAddress: user.mailForwardingAddress,
      mobile: user.mobile,
      userPassword: user.userPassword,
      promo: user.promo,
      sn: user.sn,
      snSearch: user.snSearch,
      uidParrain: user.uidParrain,
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
  });
}

export { queryLdapUser, createLdapUser };
