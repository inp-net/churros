// To parse this data:
//
//   import { Convert, LDAPTypes } from "./file";
//
//   const lDAPTypes = Convert.toLDAPTypes(json);

export interface LDAPTypes {
  clubs: Club[];
  users: User[];
  schools: School[];
  majors: Major[];
  groupesInformels: GroupesInformel[];
}

export interface Club {
  displayName: string;
  cn: string;
  ecole: School;
  objectClass: ClubStructuralObjectClass[];
  gidNumber: number;
  structuralObjectClass: ClubStructuralObjectClass;
  entryUUID: string;
  creatorsName: RsName;
  createTimestamp: Date;
  hasWebsite: boolean;
  activite: Activite;
  typeClub?: TypeClub;
  memberUid: string[];
  president: string;
  vicePresident?: string[];
  tresorier: string[];
  secretaire?: string[];
  anneePassation: number;
  entryCSN: string;
  modifiersName: School | RsName;
  modifyTimestamp: Date;
  key: string;
  mailAlias?: string[];
  local?: string;
  userPassword?: string;
  domainesAssocies?: string;
}

export enum Activite {
  Autre = 'autre',
  Bureaux = 'bureaux',
  Culture = 'culture',
  Liste = 'liste',
  Sport = 'sport',
  Tech = 'tech',
}

export enum RsName {
  CNManagerDcEtuInptDcFr = 'cn=Manager,dc=etu-inpt,dc=fr',
  RsNameCNManagerDcEtuInptDcFr = 'cn=manager,dc=etu-inpt,dc=fr',
}

export interface School {
  objectClass: SchoolStructuralObjectClass[];
  displayName?: SchoolDisplayName;
  o?: O;
  structuralObjectClass: SchoolStructuralObjectClass;
  entryUUID: string;
  creatorsName: RsName;
  createTimestamp: Date;
  entryCSN: SchoolEntryCSN;
  modifiersName: RsName;
  modifyTimestamp: Date;
  uid?: Uid;
  userPassword?: UserPassword;
  key?: Key;
}

export enum SchoolDisplayName {
  Enm = 'ENM',
  Ensat = 'ENSAT',
  Enseeiht = 'ENSEEIHT',
  Ensiacet = 'ENSIACET',
  Envt = 'ENVT',
  INPToulouse = 'INP Toulouse',
}

export enum SchoolEntryCSN {
  The20111018193153924623Z000000000000000 = '20111018193153.924623Z#000000#000#000000',
  The20111018193158434262Z000000000000000 = '20111018193158.434262Z#000000#000#000000',
  The20111018194116779564Z000000000000000 = '20111018194116.779564Z#000000#000#000000',
  The20111021062132686830Z000000000000000 = '20111021062132.686830Z#000000#000#000000',
  The20150219144717899801Z000000000000000 = '20150219144717.899801Z#000000#000#000000',
  The20160208163018485240Z000000000000000 = '20160208163018.485240Z#000000#000#000000',
  The20160503122641008347Z000000000000000 = '20160503122641.008347Z#000000#000#000000',
  The20211023100748735581Z000000000000000 = '20211023100748.735581Z#000000#000#000000',
}

export enum Key {
  OA7DcEtuInptDcFr = 'o=a7,dc=etu-inpt,dc=fr',
  OEnmDcEtuInptDcFr = 'o=enm,dc=etu-inpt,dc=fr',
  OEnsatDcEtuInptDcFr = 'o=ensat,dc=etu-inpt,dc=fr',
  OEnvtDcEtuInptDcFr = 'o=envt,dc=etu-inpt,dc=fr',
  OInpDcEtuInptDcFr = 'o=inp,dc=etu-inpt,dc=fr',
  ON7DcEtuInptDcFr = 'o=n7,dc=etu-inpt,dc=fr',
}

export enum O {
  A7 = 'a7',
  Enm = 'enm',
  Ensat = 'ensat',
  Envt = 'envt',
  Inp = 'inp',
  N7 = 'n7',
}

export enum SchoolStructuralObjectClass {
  Account = 'account',
  Ecole = 'Ecole',
  Organization = 'organization',
  SimpleSecurityObject = 'simpleSecurityObject',
  Top = 'top',
}

export enum Uid {
  ClientManager = 'client-manager',
  Tvn7 = 'tvn7',
}

export enum UserPassword {
  SSHA4SAPWCHNt9NrB0DPsrd0CGhbwaKnM8V = '{SSHA}4sAPWCHNt9nrB0/dPsrd0cGhbwaKnM8V',
  SSHAO0QuSn5JQFbdCa7RwePe2Vhhy3HWaW9 = '{SSHA}o0quSn5jQFbdCa7/RwePe2vhhy3HWaW9',
}

export enum ClubStructuralObjectClass {
  Club = 'Club',
  Groupe = 'Groupe',
  POSIXGroup = 'posixGroup',
  SimpleSecurityObject = 'simpleSecurityObject',
  TVn7Group = 'TVn7Group',
  Top = 'top',
}

export enum TypeClub {
  Asso = 'asso',
  Club = 'club',
}

export interface GroupesInformel {
  displayName: string;
  cn: string;
  objectClass: ClubStructuralObjectClass[];
  memberUid?: string[];
  gidNumber: number;
  hasWebsite: boolean;
  structuralObjectClass: ClubStructuralObjectClass;
  entryUUID: string;
  creatorsName: RsName;
  createTimestamp: Date;
  entryCSN: string;
  modifiersName: School | RsName;
  modifyTimestamp: Date;
  key: string;
  userPassword?: string;
}

export interface Major {
  objectClass: MajorStructuralObjectClass[];
  shortName: ShortName;
  displayName: MajorDisplayName;
  ou: Ou;
  ecole: School;
  structuralObjectClass: MajorStructuralObjectClass;
  entryUUID: string;
  creatorsName: RsName;
  createTimestamp: Date;
  inactif: boolean;
  entryCSN: MajorEntryCSN;
  modifiersName: RsName;
  modifyTimestamp: Date;
  key: string;
  description?: Description;
}

export enum Description {
  FormationParLaVoieDeLApprentissage = "Formation par la voie de l'apprentissage",
}

export enum MajorDisplayName {
  ApprentisHydraulique = 'Apprentis Hydraulique',
  BiotechnologieAméliorationEtProtectionDESPlantes = 'Biotechnologie, amélioration et protection des plantes',
  Chimie = 'Chimie',
  Commune = 'Commune',
  ElectroniqueEnergieElectriqueAutomatique = 'Electronique, Energie Electrique & Automatique',
  FormationParApprentissage = 'Formation par apprentissage',
  GestionÉconomieEtCommunicationDansLesAgroActivités = 'Gestion, économie et communication dans les agro-activités',
  GénieChimique = 'Génie Chimique',
  GénieDESProcédésEtInformatique = 'Génie des Procédés et Informatique',
  GénieIndustriel = 'Génie Industriel',
  GénieÉlectriqueEtAutomatique = 'Génie électrique et Automatique',
  Hydraulique = 'Hydraulique',
  IndustriesAgricolesEtAlimentairesInnovationEtQualité = 'Industries agricoles et alimentaires : innovation et qualité',
  Informatique = 'Informatique',
  InformatiqueEtRéseaux = 'Informatique et Réseaux',
  IngénierieAgronomiqueEnvironnementEtGestionDeLEspace = "Ingénierie agronomique, environnement et gestion de l'espace",
  IngénieurENM = 'Ingénieur ENM',
  IngénieurENVT = 'Ingénieur ENVT',
  LicenceAgro = 'Licence Agro',
  Mastère = 'Mastère',
  Matériaux = 'Matériaux',
  MatériauxEtProcédés = 'Matériaux et Procédés',
  MécaniqueDESFluidesÉnergétiqueEnvironnement = 'Mécanique des Fluides, Énergétique & Environnement ',
  PersonnelDeLENSEEIHT = "Personnel de l'ENSEEIHT",
  ProductionsAnimalesFilèresEtQualitéDESProduits = 'Productions animales, filères et qualité des produits',
  ProductionsVégétalesEtValorisationDESAgroressources = 'Productions végétales et valorisation des agroressources',
  SciencesDuNumérique = 'Sciences du Numérique',
  SécuritéInformatiqueTLSSEC = 'Sécurité informatique (TLS-SEC)',
  TélécomsRéseaux = 'Télécoms/Réseaux',
  Électronique = 'Électronique',
  ÉlectroniqueEtGénieÉlectrique = 'Électronique et Génie électrique',
}

export enum MajorEntryCSN {
  The20210823181533722015Z000000000000000 = '20210823181533.722015Z#000000#000#000000',
  The20210823193600970088Z000000000000000 = '20210823193600.970088Z#000000#000#000000',
  The20210823193654151593Z000000000000000 = '20210823193654.151593Z#000000#000#000000',
  The20210823193700986624Z000000000000000 = '20210823193700.986624Z#000000#000#000000',
  The20210823193917086560Z000000000000000 = '20210823193917.086560Z#000000#000#000000',
  The20210823194123220011Z000000000000000 = '20210823194123.220011Z#000000#000#000000',
  The20210823194239634928Z000000000000000 = '20210823194239.634928Z#000000#000#000000',
  The20210823194252185840Z000000000000000 = '20210823194252.185840Z#000000#000#000000',
  The20210823194301578448Z000000000000000 = '20210823194301.578448Z#000000#000#000000',
  The20210823202332736971Z000000000000000 = '20210823202332.736971Z#000000#000#000000',
  The20210823202332744967Z000000000000000 = '20210823202332.744967Z#000000#000#000000',
  The20210823202332749262Z000000000000000 = '20210823202332.749262Z#000000#000#000000',
  The20210823202332756631Z000000000000000 = '20210823202332.756631Z#000000#000#000000',
  The20210823202332760326Z000000000000000 = '20210823202332.760326Z#000000#000#000000',
  The20210823202332767455Z000000000000000 = '20210823202332.767455Z#000000#000#000000',
  The20210823202332771183Z000000000000000 = '20210823202332.771183Z#000000#000#000000',
  The20210823202332778207Z000000000000000 = '20210823202332.778207Z#000000#000#000000',
  The20210823202332782689Z000000000000000 = '20210823202332.782689Z#000000#000#000000',
  The20210823202332790281Z000000000000000 = '20210823202332.790281Z#000000#000#000000',
  The20210823202332794524Z000000000000000 = '20210823202332.794524Z#000000#000#000000',
  The20210823202332802307Z000000000000000 = '20210823202332.802307Z#000000#000#000000',
  The20210823202332806416Z000000000000000 = '20210823202332.806416Z#000000#000#000000',
  The20210823202332810810Z000000000000000 = '20210823202332.810810Z#000000#000#000000',
  The20210823202332818326Z000000000000000 = '20210823202332.818326Z#000000#000#000000',
  The20210823202332823312Z000000000000000 = '20210823202332.823312Z#000000#000#000000',
  The20210823202332831196Z000000000000000 = '20210823202332.831196Z#000000#000#000000',
  The20210823202332835534Z000000000000000 = '20210823202332.835534Z#000000#000#000000',
  The20210823202332843009Z000000000000000 = '20210823202332.843009Z#000000#000#000000',
  The20210823202332847139Z000000000000000 = '20210823202332.847139Z#000000#000#000000',
  The20210823202332859852Z000000000000000 = '20210823202332.859852Z#000000#000#000000',
  The20210823202332864054Z000000000000000 = '20210823202332.864054Z#000000#000#000000',
  The20210823202332884687Z000000000000000 = '20210823202332.884687Z#000000#000#000000',
  The20210823202457832012Z000000000000000 = '20210823202457.832012Z#000000#000#000000',
}

export enum MajorStructuralObjectClass {
  Filiere = 'Filiere',
  OrganizationalUnit = 'organizationalUnit',
  Top = 'top',
}

export enum Ou {
  Ahy = 'ahy',
  Biotech = 'biotech',
  C = 'c',
  Ch = 'ch',
  Eeea = 'eeea',
  Ege = 'ege',
  En = 'en',
  Enm = 'enm',
  Envt = 'envt',
  Fiva = 'fiva',
  Gc = 'gc',
  Gea = 'gea',
  Geca = 'geca',
  Gi = 'gi',
  Gpi = 'gpi',
  Hy = 'hy',
  IR = 'ir',
  Iaa = 'iaa',
  Iaege = 'iaege',
  Imat = 'imat',
  In = 'in',
  Ingenieur = 'ingenieur',
  La = 'la',
  Mast = 'mast',
  Mep = 'mep',
  Mfee = 'mfee',
  Pafqp = 'pafqp',
  Personnel = 'personnel',
  Pvva = 'pvva',
  SDN = 'sdn',
  TLSSEC = 'tls-sec',
  Tr = 'tr',
}

export enum ShortName {
  Ahy = 'AHY',
  Biotech = 'Biotech',
  Chimie = 'Chimie',
  Eeea = 'EEEA',
  Ege = 'EGE',
  En = 'EN',
  Enm = 'ENM',
  Envt = 'ENVT',
  FCommune = 'F. commune',
  Fiva = 'FIVA',
  Gc = 'GC',
  Gea = 'GEA',
  Gestion = 'Gestion',
  Gi = 'GI',
  Gpi = 'GPI',
  Hydro = 'Hydro',
  IR = 'IR',
  Iaa = 'IAA',
  Iaege = 'IAEGE',
  Info = 'Info',
  La = 'LA',
  Mastère = 'Mastère',
  Matériaux = 'Matériaux',
  Mep = 'MEP',
  Mfee = 'MFEE',
  Pafqp = 'PAFQP',
  Personnel = 'Personnel',
  Pvva = 'PVVA',
  Sn = 'SN',
  TLSSEC = 'TLS-SEC',
  Tr = 'TR',
}

export interface User {
  uid: string;
  objectClass: UserStructuralObjectClass[];
  jpegPhoto?: string;
  uidNumber: number;
  filiere: Filiere;
  genre: number;
  cn: string;
  userPassword: string;
  loginTP: string;
  givenNameSearch: string;
  msn?: string[];
  hasWebsite: boolean;
  mail: string;
  ecole: School;
  promo: number;
  loginShell: LoginShell;
  gidNumber: number;
  snSearch: string;
  nickname?: string;
  postalAddress?: string;
  homePhone?: string;
  displayName: string;
  mobile?: string;
  birthdate: Date;
  inscritAE: boolean;
  mailAnnexe?: string[];
  sn: string;
  givenName: string;
  structuralObjectClass: UserStructuralObjectClass;
  entryUUID: string;
  creatorsName: RsName;
  createTimestamp: Date;
  mailEcole: string;
  mailForwardingAddress?: string;
  homeDirectory: string;
  inscritFrappe: boolean;
  entryCSN: string;
  modifiersName: School | RsName;
  modifyTimestamp: Date;
  key: string;
  parentsAddress?: string;
  skype?: string;
  personalWebsite?: string[];
  aim?: string;
  jabber?: string[];
  mailLocal?: string[];
  googleTalk?: string;
  icq?: string;
  yahoo?: string[];
  uidParrain?: string;
  sshKey?: string[];
  inscritPassVieEtudiant?: boolean;
  finPassVieEtudiant?: number;
  yubiKeyId?: string[];
}

export interface Filiere {
  objectClass: MajorStructuralObjectClass[];
  shortName: ShortName;
  displayName: MajorDisplayName;
  ou: Ou;
  ecole: Key;
  structuralObjectClass: MajorStructuralObjectClass;
  entryUUID: string;
  creatorsName: RsName;
  createTimestamp: Date;
  inactif: boolean;
  entryCSN: MajorEntryCSN;
  modifiersName: RsName;
  modifyTimestamp: Date;
  description?: Description;
}

export enum LoginShell {
  BinBash = '/bin/bash',
  BinFalse = '/bin/false',
  BinZsh = '/bin/zsh',
  USRBinFish = '/usr/bin/fish',
  USRBinZsh = '/usr/bin/zsh',
}

export enum UserStructuralObjectClass {
  Eleve = 'Eleve',
  InetOrgPerson = 'inetOrgPerson',
  OrganizationalPerson = 'organizationalPerson',
  POSIXAccount = 'posixAccount',
  Person = 'person',
  QmailUser = 'qmailUser',
  ShadowAccount = 'shadowAccount',
  Top = 'top',
  YubiKeyUser = 'yubiKeyUser',
}

// Converts JSON strings to/from your types
export class Convert {
  public static toLDAPTypes(json: string): LDAPTypes {
    return JSON.parse(json);
  }

  public static lDAPTypesToJson(value: LDAPTypes): string {
    return JSON.stringify(value);
  }
}
