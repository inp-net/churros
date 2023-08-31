/* eslint-disable no-console */
import ldap from 'ldapjs';

// Configuration de la connexion LDAP
const ldapClient = ldap.createClient({
  url: process.env['LDAP_URL'] || 'ldap://localhost:389',
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