// To parse this data:
//
//   import { Convert, NewSubjectsTypes } from "./file";
//
//   const newSubjectsTypes = Convert.toNewSubjectsTypes(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export type NewSubjectsTypes = {
  '3EA': The3Ea;
  SN: Sn;
  MF2E: Mf2E;
};

export type The3Ea = {
  '1A': The3Ea1A;
  '2A': The3Ea2A;
  '3A': The3Ea3A;
};

export type The3Ea1A = {
  FISA: PurpleFISA;
  FISE: PurpleFISE;
};

export type PurpleFISA = {
  '(*)': Purple;
};

export type Purple = {
  N5AE01A: string;
  N5AE01B: string;
  N5AE02A: string;
  N5AE02B: string;
  N5AE03A: string;
  N5AE03B: string;
  N5AE03C: string;
  N5AE03D: string;
  N5AE04A: string;
  N5AE04B: string;
  N5AE04C: string;
  N5AE04D: string;
  N6AE01A: string;
  N6AE01B: string;
  N6AE01C: string;
  N6AE02A: string;
  N6AE02B: string;
  N6AE02C: string;
  N6AE03A: string;
  N6AE03B: string;
  N6AE03C: string;
  N6AE04A: string;
  N6AE04B: string;
  N6AE04C: string;
  N6AE04D: string;
};

export type PurpleFISE = {
  '(*)': FISEClass;
  'Objets connectés': ObjetsConnectés;
  'Avion plus électrique': AvionPlusÉlectrique;
  'Introduction aux télécommunications': IntroductionAuxTélécommunications;
};

export type FISEClass = {
  N5EE01: string;
  N5EE01A: string;
  N5EE01B: string;
  N5EE01C: string;
  N5EE02: string;
  N5EE02A: string;
  N5EE02B: string;
  N5EE03: string;
  N5EE03A: string;
  N5EE03B: string;
  N5EE03C: string;
  N5EE04: string;
  N5EE04A: string;
  N5EE04B: string;
  N5EE04C: string;
  N5EE05: string;
  N5EE05A1: string;
  N5EE05A2: string;
  N5EE05B: string;
  N5EE05C: string;
  N6EE01: string;
  N6EE01A: string;
  N6EE01B: string;
  N6EE01C: string;
  N6EE02: string;
  N6EE02A: string;
  N6EE02B: string;
  N6EE02C: string;
  N6EE03: string;
  N6EE03A: string;
  N6EE03B: string;
  N6EE03C: string;
  N6EE03D: string;
  N6EE04: string;
  N6EE04A: string;
  N6EE04B: string;
  N6EE04C: string;
  N6EE04D: string;
};

export interface AvionPlusÉlectrique {
  N6EE06A: string;
  N6EE06B: string;
  N6EE06C: string;
}

export interface IntroductionAuxTélécommunications {
  N6EE07A: string;
  N6EE07B: string;
}

export interface ObjetsConnectés {
  PRJOC2: string;
  PRJOC3: string;
  PRJOC4: string;
  PRJOC5: string;
}

export type The3Ea2A = {
  FISA: FluffyFISA;
  FISE: FluffyFISE;
};

export type FluffyFISA = {
  '(*)': Fluffy;
  EN: En;
  GEA: Gea;
};

export type Fluffy = {
  N7AE01: string;
  N7AE01A: string;
  N7AE01B: string;
  N7AE01C: string;
  N7AE07: string;
  N7AE07A: string;
  N7AE07B: string;
  N7AE03: string;
  N7AE03A: string;
  N7AE03B: string;
  N7AE03C: string;
  NA7AE05: string;
};

export type En = {
  N7AE04: string;
  N7AE04A: string;
  N7AE04B: string;
  N7AE04D: string;
  N8AE01: string;
  N8AE01A: string;
  N8AE01B: string;
  N8AE01C: string;
  N8AE10: string;
  N8AE03A: string;
  N8AE03B: string;
  N8AE09A: string;
  N8AE11: string;
  N8AE11A: string;
  N8AE03C: string;
  N8AE11B: string;
  N8AE11C: string;
  N8AE12: string;
  N8AE12A: string;
  N8AE12B: string;
  N8AE12C: string;
};

export type Gea = {
  N7AE08: string;
  N7AE08A: string;
  N7AE08B: string;
  N7AE08C: string;
  N8AE17: string;
  N8AE13C: string;
  N8AE17A: string;
  N8AE14: string;
  N8AE14A: string;
  N8AE05B: string;
  N8AE08A: string;
  N8AE05: string;
  N8AE15: string;
  N8AE15A: string;
  N8AE15B: string;
  N8AE16: string;
  N8AE16A: string;
  N8AE16B: string;
  N8AE16C: string;
};

export type FluffyFISE = {
  Énergie: Énergie;
  Électronique: Électronique;
  'Électronique Énergie Électrique et Simulation (EEES)': ÉlectroniqueÉnergieÉlectriqueEtSimulationEEES;
  InSYS: FISEInSYS;
  SysCom: FISESysCOM;
  SATR: Satr;
  SM: Sm;
  PN: FisePn;
  IATI: Iati;
};

export type Iati = {
  N8EE22: string;
  N8EE06B: string;
  N8EE06C: string;
  N8EE22C: string;
  N8EE028: string;
  N8EE03A: string;
  N8EE03C: string;
  N8EE03D: string;
  N8EE29: string;
  N8EE29A: string;
  N8EE29B: string;
  N8EE29C: string;
  N8EE30: string;
  N8EE30A: string;
  N8EE30B: string;
  N8EE30C: string;
  N8EE30D: string;
  N8EE31: string;
  N8EE32: string;
  N8EE32A: string;
  N8EE32B: string;
  N8EE32C: string;
  N8EE32D: string;
  N8EE33A: string;
  N8EE33B: string;
};

export type FISEInSYS = {
  N8EE01: string;
  N8EE01A: string;
  N8EE02: string;
  N8EE02A: string;
  N8EE02B: string;
  N8EE04A: string;
  N8EE02D: string;
  N8EE03: string;
  N8EE03A: string;
  N8EE03C: string;
  N8EE03F: string;
  N8EE04: string;
  N8EE02C: string;
  N8EE04B: string;
  N8EE04D: string;
  N8EE05: string;
  N8EE05A: string;
  N8EE05B: string;
};

export type FisePn = {
  N8EE36: string;
  N8EE20A: string;
  N8EE20C: string;
  N8EE21C: string;
  N8EE21E: string;
  N8EE27: string;
  N8EE27A: string;
  N8EE09D: string;
  N8EE11: string;
  N8EE11A: string;
  N8EE11C: string;
  N8EE22B: string;
  N8EE21B: string;
  N8EE22A: string;
  N8EE26: string;
  N8EE26A: string;
  N8EE07E: string;
  N8EE07F: string;
  N8EE22: string;
  N8EE06B: string;
  N8EE06C: string;
  N8EE22C: string;
};

export type Satr = {
  N8EE13: string;
  N8EE13A: string;
  N8EE13B: string;
  N8EE13C: string;
  N8EE13D: string;
  N8EE14: string;
  N8EE14A: string;
  N8EE14B: string;
  N8EE14C: string;
  N8EE14D: string;
  N8EE15: string;
  N8EE15A: string;
  N8EE15C: string;
  N8EE15D: string;
  N8EE15E: string;
  N8EE16: string;
  N8EE16A: string;
  N8EE16B: string;
  N8EE16C: string;
  N8EE16D: string;
  N8EE16E: string;
  N8EE17: string;
  N8EE17A: string;
  N8EE17B: string;
  N8EE17C: string;
};

export type Sm = {
  N8EE13: string;
  N8EE13A: string;
  N8EE13B: string;
  N8EE13C: string;
  N8EE13D: string;
  N8EE14: string;
  N8EE14A: string;
  N8EE14B: string;
  N8EE14C: string;
  N8EE14D: string;
  N8EE15: string;
  N8EE15A: string;
  N8EE15C: string;
  N8EE15D: string;
  N8EE15E: string;
  N8EE24: string;
  N8EE20A: string;
  N8EE20C: string;
  N8EE20D: string;
  N8EE24A: string;
  N8EE25: string;
  N8EE21A: string;
  N8EE21B: string;
  N8EE21C: string;
  N8EE21E: string;
};

export type FISESysCOM = {
  N8EE22: string;
  N8EE06B: string;
  N8EE06C: string;
  N8EE22C: string;
  N8EE26: string;
  N8EE26A: string;
  N8EE07E: string;
  N8EE07F: string;
  N8EE23: string;
  N8EE08B: string;
  N8EE04A: string;
  N8EE23B: string;
  N8EE34: string;
  N8EE22A: string;
  N8EE22B: string;
  N8EE04B: string;
  N8EE04D: string;
  N8EE05: string;
  N8EE05A: string;
  N8EE05B: string;
};

export interface Électronique {
  N7EE06: string;
  N7EE06A: string;
  N7EE06B: string;
  N7EE06C: string;
  N7EE06D: string;
  N7EE07: string;
  N7EE07B: string;
  N7EE07C: string;
  N7EE08: string;
  N7EE08A: string;
  N7EE08B: string;
  N7EE09: string;
  N7EE09A: string;
  N7EE09B: string;
  N7EE09D: string;
  N7EE10: string;
  N7EE10A: string;
  N7EE10B: string;
  N7EE10C: string;
}

export interface ÉlectroniqueÉnergieÉlectriqueEtSimulationEEES {
  N7EE09: string;
  N7EE09A: string;
  N7EE09B: string;
  N7EE09D: string;
  N7EE13: string;
  N7EE06C: string;
  N7EE10B: string;
  N7EE13A: string;
  N7EE14: string;
  N7EE10A: string;
  N7EM04B: string;
  N7EE15: string;
  N7EE15A: string;
  N7EE03E: string;
  N7EE03F: string;
  N7EE16: string;
  N7EE03B: string;
  N7EE16A: string;
}

export interface Énergie {
  N7EE01: string;
  N7EE01A: string;
  N7EE01B: string;
  N7EE01C: string;
  N7EE02: string;
  N7EE02A: string;
  N7EE02B: string;
  N7EE03: string;
  N7EE03B: string;
  N7EE03E: string;
  N7EE03F: string;
  N7EE04: string;
  N7EE04A: string;
  N7EE04B: string;
  N7EE04C: string;
  N7EE04D: string;
  N7EE05: string;
  N7EE05A: string;
  N7EE05B: string;
  N7EE05C: string;
  N7EE05D: string;
}

export type The3Ea3A = {
  '(*)': Tentacled;
};

export type Tentacled = {
  InSYS: InSYS;
  SysCom: SysCOM;
  ACISE: Acise;
  CERE: Cere;
  EMA: Ema;
  PN: Pn;
  'Éco-Énergie': ÉcoÉnergie;
};

export type Acise = {
  N9EE16: string;
  N9EE16A: string;
  N9EE16B: string;
  N9EE16C: string;
  N9EE17: string;
  N9EE17A: string;
  N9EE17B: string;
  N9EE17C: string;
  N9EE17D: string;
  N9EE17E: string;
  N9EE17F: string;
  N9EE18: string;
  N9EE18A: string;
  N9EE18B: string;
  N9EE18C: string;
  N9EE18D: string;
  N9EE18E: string;
  N9EE19: string;
  N9EE19A: string;
  N9EE19B: string;
  N9EE19C: string;
  N9EE19D: string;
  N9EE19E: string;
  N9EE20: string;
  N9EE20A: string;
  N9EE20B: string;
  N9EE20C: string;
  N9EE20D: string;
  N9EK01C: string;
};

export type Cere = {
  N9EE21: string;
  N9EE21A: string;
  N9EE21B: string;
  N9EE21C: string;
  N9EE22: string;
  N9EE22A: string;
  N9EE22B: string;
  N9EE22C: string;
  N9EE22D: string;
  N9EE23: string;
  N9EE23A: string;
  N9EE23B: string;
  N9EE23C: string;
  N9EE23D: string;
  N9EE24: string;
  N9EE24B: string;
  N9EE24C: string;
  N9EE16C: string;
  N9EE24D: string;
  N9EE25: string;
  N9EE25A: string;
  N9EE25B: string;
  N9EE25C: string;
  N9EE25D: string;
  N9EK01C: string;
};

export type Ema = {
  N9EE26: string;
  N9EE26B: string;
  N9EE26C: string;
  N9EE26D: string;
  N9EE27: string;
  N9EE27A: string;
  N9EE27B: string;
  N9EE27C: string;
  N9EE27D: string;
  N9EE28: string;
  N9EE28B: string;
  N9EE28C: string;
  N9EE28D: string;
  N9EE28E: string;
  N9EE29: string;
  N9EE29A: string;
  N9EE29B: string;
  N9EE29C: string;
  N9EE29D: string;
  N9EE16C: string;
  N9EE30: string;
  N9EE30A: string;
  N9EE30B: string;
  N9EE30D: string;
  N9EE16B: string;
  N9EK01C: string;
};

export type InSYS = {
  N9EE46: string;
  N9EE04B: string;
  N9EE06C: string;
  N9EE46A: string;
  N9EE06D: string;
  N9EE47: string;
  N9EE05A: string;
  N9EE04A: string;
  N9EE05C: string;
  N9EE48: string;
  N9EE06B: string;
  N9EE48A: string;
  N9EE07A: string;
  N9EE48B: string;
  N9EEd49: string;
  N9EE06A: string;
  N9EE07B: string;
  N9EE08: string;
  N9EE08A: string;
  N9EE08B: string;
  N9EE09: string;
  N9EE09A: string;
  N9EE09B: string;
  N9EE09C: string;
  N9EE09D: string;
  N9EE10: string;
  N9EE10A: string;
  N9EE10B: string;
  N9EE10C: string;
  N9EK01C: string;
};

export type Pn = {
  N9EM03: string;
  N9EE54: string;
  N9EE53A: string;
  N9EE15C: string;
  N9EE14C: string;
  N9EE56: string;
  N9EE26A: string;
  N9EE26B: string;
  N9EE26C: string;
  N9EE26D: string;
  N9EE55: string;
  N9EE13D: string;
  N9EE29C: string;
  N9EE33A: string;
  N9EE11C: string;
  N9EE11B: string;
  N9EE33: string;
  N9EE33C: string;
  N9EE27A: string;
  N9EE27B: string;
  N9EE33D: string;
  N9EK01C: string;
};

export type SysCOM = {
  N9EE50: string;
  N9EE14B: string;
  N9EE11B: string;
  N9EE14D: string;
  N9EE50A: string;
  N9EE51: string;
  N9EE12A: string;
  N9EE12B: string;
  N9EE06D: string;
  N9EE13A: string;
  N9EE52: string;
  N9EE13B: string;
  N9EE13C: string;
  N9EE13D: string;
  N9EE48A: string;
  N9EE14A: string;
  N9EE13E: string;
  N9EE15: string;
  N9EE15A: string;
  N9EE15B: string;
  N9EE15C: string;
  N9EE15D: string;
  N9EE10: string;
  N9EE10A: string;
  N9EE10B: string;
  N9EE10C: string;
  N9EE53: string;
  N9EE11C: string;
  N9EE53A: string;
  N9EE14C: string;
  N9EE14E: string;
  N9EK01C: string;
};

export interface ÉcoÉnergie {
  HARMO1: string;
  HARMO2: string;
  HARMO3: string;
  N9EE34: string;
  N9EE35B: string;
  N9EE34B: string;
  N9EE34C: string;
  N9EE34E: string;
  N9EE35: string;
  N9EE35A: string;
  N9EE35F: string;
  N9EE35G: string;
  N9EE35H: string;
  N9EE35I: string;
  N9EE35D: string;
  N9EE35E: string;
  N9EE36: string;
  N9EE36A: string;
  N9EE36B: string;
  N9EE36C: string;
  N9EE36D: string;
  N9EE36E: string;
  N9EE37: string;
  N9EK01A: string;
  N9EE37A: string;
}

export type Mf2E = {
  '1A': Mf2E1A;
  '2A': Mf2E2A;
  '3A': Mf2E3A;
};

export type Mf2E1A = {
  FISA: TentacledFISA;
  FISE: TentacledFISE;
};

export type TentacledFISA = {
  '(*)': string[];
};

export type TentacledFISE = {
  '(*)': Array<Sticky | string>;
};

export type Sticky = {
  A32?: string;
  A35?: string;
  A52?: string;
  A55?: string;
  A61?: string;
  B32?: string;
  B33?: string;
  B34?: string;
  B35?: string;
  B36?: string;
  N6EM03C?: string;
  B43?: string;
  B51?: string;
  B52?: string;
  B53?: string;
  B61?: string;
  N5M2A?: string;
  NAH4B?: string;
  NBH4B?: string;
  N6EM02A?: string;
  NBH10A?: string;
};

export type Mf2E2A = {
  FISE: StickyFISE;
};

export type StickyFISE = {
  '(*)': Array<Indigo | string>;
};

export type Indigo = {
  N8EM04A?: string;
  N8EM04B?: string;
  NDH4Bbis?: string;
  N8EM04C?: string;
  N8EM06B?: string;
  N8EM07A?: string;
  N8EM07B?: string;
  N8EM07C?: string;
};

export type Mf2E3A = {
  '(*)': Indecent;
};

export type Indecent = {
  '(*)': Array<{ [key: string]: string } | string>;
  'Mastère Spécialisé Hydraulique': MastèreSpécialiséHydraulique;
};

export interface MastèreSpécialiséHydraulique {
  MSH001: string;
  MSH002: string;
  MSH003: string;
  A51: string;
  E21: string;
  HYE22: string;
  HYE23: string;
  'MSH-HYDR': string;
  TRAI: string;
  EURB: string;
  MSH04: string;
  CYCL: string;
  HSOU: string;
  HSTA: string;
  HTRA: string;
  BESZ: string;
  MSOL: string;
  INGO: string;
  STRU: string;
  IMPA: string;
  TELE: string;
  SIGE: string;
  RISP: string;
  HLCO: string;
}

export type Sn = {
  '1A': Sn1A;
  '2A': Sn2A;
  '3A': Sn3A;
};

export type Sn1A = {
  FISA: StickyFISA;
  FISE: IndigoFISE;
};

export type StickyFISA = {
  '(*)': Array<Hilarious | string>;
};

export type Hilarious = {
  N5AN01A?: string;
  N5AN01B?: string;
};

export type IndigoFISE = {
  '(*)': Array<Ambitious | string>;
};

export type Ambitious = {
  EDP?: string;
  Intégration?: string;
  Archi?: string;
  PIM?: string;
  SEC?: string;
  CS?: string;
  Rézoloco?: string;
  Télécom?: string;
  TS?: string;
  TOB?: string;
};

export type Sn2A = {
  FISE: IndecentFISE;
  FISA: IndigoFISA;
};

export type IndigoFISA = {
  ModIA: FISAModIA;
  '(*)': Cunning;
};

export type Cunning = {
  N7AN01: string;
  N7AN01A: string;
  N7AN01C: string;
  N7AN01D: string;
  N7AN02: string;
  N7AN02A: string;
  N7AN02B: string;
  N7AN03: string;
  N7AN03A: string;
  N7AN03B: string;
  N7AN04: string;
  N7AN04A: string;
  N7AN04B: string;
  N8AN01: string;
  N8AN01B: string;
  N8AN01C: string;
  N8AN02: string;
  N8AN02A: string;
  N8AN02B: string;
  N8AN02C: string;
  N8AN02D: string;
  N8AN03: string;
  N8AN03A: string;
  N8AN03B: string;
};

export type FISAModIA = {
  N8EAN01: string;
  N8EAN01A: string;
  N8EAN01B: string;
  N8EAN02: string;
  N8EAN02A: string;
  N8EAN03: string;
  N8EAN03A: string;
  N8EAN03B: string;
  N8EAN04: string;
  N8EAN04A: string;
};

export type IndecentFISE = {
  ASR: ASR;
  'HPC Big Data': HPCBigData;
  Réseau: Réseau;
  IMM: FiseImm;
  Logiciel: FISELogiciel;
  Télécom: Télécom;
};

export type ASR = {
  N7EN05: string;
  N7EN05A: string;
  N7EN05B: string;
  N7EN05C: string;
  N7EN06: string;
  N7EN06A: string;
  N7EN06B: string;
  N7EN07: string;
  N7EN07A: string;
  N7EN08: string;
  N7EN08A: string;
  N7EN08B: string;
  N7EN08C: string;
  N7EN09: string;
  N7EN09A: string;
  N7EN09B: string;
  N7EN09C: string;
  N8EN01: string;
  N8EN01A: string;
  N8EN01B: string;
  N8EN01C: string;
  N8EN01E: string;
  N8EN18: string;
  N8EN18A: string;
  N8EN18B: string;
  N8EN18C: string;
  N8EN18D: string;
  N8EN21: string;
  N8EN21A: string;
  N8EN23: string;
  N8EN23A: string;
  N8EN23B: string;
  N8EN23C: string;
  N8EN25: string;
  N8EN25A: string;
  N8EN25B: string;
  N8EN25C: string;
  N8EN25D: string;
};

export type HPCBigData = {
  N7EN08: string;
  N7EN08A: string;
  N7EN08B: string;
  N7EN08C: string;
  N7EN10: string;
  N7EN10A: string;
  N7EN10B: string;
  N7EN11: string;
  N7EN11A: string;
  N7EN12: string;
  N7EN12A: string;
  N7EN12B: string;
  N7EN16: string;
  N7EN16A: string;
  N7EN16B: string;
  N8EN01: string;
  N8EN01A: string;
  N8EN01B: string;
  N8EN01C: string;
  N8EN01E: string;
  N8EN03: string;
  N8EN03A: string;
  N8EN03B: string;
  N8EN03C: string;
  N8EN05: string;
  N8EN05A: string;
  N8EN05B: string;
  N8EN06: string;
  N8EN06A: string;
  N8EN06B: string;
  N8EN07: string;
  N8EN07A: string;
  N8EN07B: string;
};

export type FiseImm = {
  N7EN08: string;
  N7EN08A: string;
  N7EN08B: string;
  N7EN08C: string;
  N7EN09: string;
  N7EN09A: string;
  N7EN09B: string;
  N7EN09C: string;
  N7EN10: string;
  N7EN10A: string;
  N7EN10B: string;
  N7EN11: string;
  N7EN11A: string;
  N7EN12: string;
  N7EN12A: string;
  N7EN12B: string;
  N8EN01: string;
  N8EN01A: string;
  N8EN01B: string;
  N8EN01C: string;
  N8EN01E: string;
  N8EN04: string;
  N8EN04A: string;
  N8EN06: string;
  N8EN06A: string;
  N8EN06B: string;
  N8EN11: string;
  N8EN11A: string;
  N8EN11B: string;
  N8EN11C: string;
  N8EN12: string;
  N8EN12A: string;
  N8EN12B: string;
};

export type FISELogiciel = {
  N7EN09: string;
  N7EN09A: string;
  N7EN09B: string;
  N7EN09C: string;
  N7EN10: string;
  N7EN10A: string;
  N7EN10B: string;
  N7EN11: string;
  N7EN11A: string;
  N7EN12: string;
  N7EN12A: string;
  N7EN12B: string;
  N7EN13: string;
  N7EN13A: string;
  N8EN01: string;
  N8EN01A: string;
  N8EN01B: string;
  N8EN01C: string;
  N8EN01E: string;
  N8EN08: string;
  N8EN08A: string;
  N8EN08B: string;
  N8EN09: string;
  N8EN09A: string;
  N8EN09B: string;
  N8EN09C: string;
  N8EN10: string;
  N8EN10A: string;
  N8EN12: string;
  N8EN12A: string;
  N8EN12B: string;
};

export interface Réseau {
  N7EN02: string;
  N7EN02A: string;
  N7EN02B: string;
  N7EN02C: string;
  N7EN03: string;
  N7EN03A: string;
  N7EN03B: string;
  N7EN03C: string;
  N7EN03D: string;
  N7EN05: string;
  N7EN05A: string;
  N7EN05B: string;
  N7EN05C: string;
  N7EN06: string;
  N7EN06A: string;
  N7EN06B: string;
  N7EN09: string;
  N7EN09A: string;
  N7EN09B: string;
  N7EN09C: string;
  N8EN18: string;
  N8EN18A: string;
  N8EN18B: string;
  N8EN18C: string;
  N8EN18D: string;
  N8EN20: string;
  N8EN20B: string;
  N8EN20C: string;
  N8EN22: string;
  N8EN22A: string;
  N8EN22B: string;
  N8EN23: string;
  N8EN23A: string;
  N8EN23B: string;
  N8EN23C: string;
  N8EN24: string;
  N8EN24A: string;
  N8EN24B: string;
  N8EN24C: string;
  N8EN24D: string;
  N8EN24E: string;
}

export interface Télécom {
  N7EN01: string;
  N7EN01A: string;
  N7EN01B: string;
  N7EN01C: string;
  N7EN02: string;
  N7EN02A: string;
  N7EN02B: string;
  N7EN02C: string;
  N7EN03: string;
  N7EN03A: string;
  N7EN03B: string;
  N7EN03C: string;
  N7EN03D: string;
  N7EN05: string;
  N7EN05A: string;
  N7EN05B: string;
  N7EN05C: string;
  N7EN06: string;
  N7EN06A: string;
  N7EN06B: string;
  N8EN13: string;
  N8EN13A: string;
  N8EN13B: string;
  N8EN13C: string;
  N8EN13D: string;
  N8EN14: string;
  N8EN14A: string;
  N8EN14B: string;
  N8EN14C: string;
  N8EN14D: string;
  N8EN16: string;
  N8EN16A: string;
  N8EN16C: string;
  N8EN19: string;
  N8EN19A: string;
  N8EN19B: string;
  N8EN19C: string;
  N8EN20: string;
  N8EN20A: string;
  N8EN20B: string;
  N8EN20C: string;
}

export type Sn3A = {
  '(*)': Magenta;
};

export type Magenta = {
  'HPC et Big Data': HPCEtBigData;
  IBDIOT: Ibdiot;
  IMM: Imm;
  SEmbiIOT: SEmbiIOT;
  Logiciel: Logiciel;
  'Télécom et objets connectés': TélécomEtObjetsConnectés;
  ModIA: Array<ModIAModIA | string>;
};

export type HPCEtBigData = {
  N9EN11: string;
  N9EN11A: string;
  N9EN11B: string;
  N9EN11C: string;
  N9EN19: string;
  N9EN20: string;
  N9EN20A: string;
  N9EN20B: string;
  N9EN20C: string;
  N9EN20E: string;
  N9EN21: string;
  N9EN21A: string;
};

export type Ibdiot = {
  N9EN01: string;
  N9EN01B: string;
  N9EN01C: string;
  N9EN01D: string;
  N9EN08: string;
  N9EN08A: string;
  N9EN08B: string;
  N9EN09: string;
  N8EN09B: string;
  N9EN09C: string;
  N9EN09D: string;
  N9EN09E: string;
  N9EN09F: string;
  N9EN10: string;
  N9EN10A: string;
  N9EN10B: string;
  N9EN10C: string;
};

export type Imm = {
  N9EN15: string;
  N9EN15A: string;
  N9EN16: string;
  N9EN16A: string;
  N9EN16B: string;
  N9EN16C: string;
  N9EN17: string;
  N9EN17A: string;
  N9EN17B: string;
  N9EN17C: string;
  N9EN18: string;
  N9EN18A: string;
};

export type Logiciel = {
  N9EN05: string;
  N9EN05A: string;
  N9EN05B: string;
  N9EN05C: string;
  N9EN11: string;
  N9EN11A: string;
  'N9EN 11B': string;
  N9EN11C: string;
  N9EN12: string;
  N9EN12A: string;
  N9EN12B: string;
  N9EN13: string;
  N9EN13A: string;
  N9EN13B: string;
  N9EN13C: string;
  N9EN13D: string;
};

export type ModIAModIA = {
  N0EAN01?: string;
  N0EAN02?: string;
  N0EAN03?: string;
  N0EAN04?: string;
  N0EAN05?: string;
};

export type SEmbiIOT = {
  N9EN05: string;
  N9EN05A: string;
  N9EN05B: string;
  N9EN05C: string;
  N9EN06: string;
  N9EN06A: string;
  N9EN06B: string;
  N9EN06C: string;
  N9EN07: string;
  N9EN07A: string;
  N9EN07B: string;
  N9EN07C: string;
  N9EN07D: string;
  N9EN23: string;
  N9EN23A: string;
  N9EN23B: string;
  N9EN23C: string;
  N9EN23D: string;
};

export interface TélécomEtObjetsConnectés {
  N9EN02: string;
  N9EN02A: string;
  N9EN02B: string;
  N9EN02C: string;
  N9EN03: string;
  N9EN03B: string;
  N9EN03C: string;
  N9EN03D: string;
  N9EN04: string;
  N9EN04A: string;
  N9EN04B: string;
  N9EN14: string;
  N9EN14A: string;
  N9EN14B: string;
  N9EN14C: string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toNewSubjectsTypes(json: string): NewSubjectsTypes {
    return cast(JSON.parse(json), r('NewSubjectsTypes'));
  }

  public static newSubjectsTypesToJson(value: NewSubjectsTypes): string {
    return JSON.stringify(uncast(value, r('NewSubjectsTypes')), null, 2);
  }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
  const prettyTyp = prettyTypeName(typ);
  const parentText = parent ? ` on ${parent}` : '';
  const keyText = key ? ` for key "${key}"` : '';
  throw Error(
    `Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`,
  );
}

function prettyTypeName(typ: any): string {
  if (Array.isArray(typ)) {
    if (typ.length === 2 && typ[0] === undefined) {
      return `an optional ${prettyTypeName(typ[1])}`;
    } else {
      return `one of [${typ
        .map((a) => {
          return prettyTypeName(a);
        })
        .join(', ')}]`;
    }
  } else if (typeof typ === 'object' && typ.literal !== undefined) {
    return typ.literal;
  } else {
    return typeof typ;
  }
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }));
    typ.jsonToJS = map;
  }
  return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }));
    typ.jsToJSON = map;
  }
  return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val;
    return invalidValue(typ, val, key, parent);
  }

  function transformUnion(typs: any[], val: any): any {
    // val must validate against one typ in typs
    const l = typs.length;
    for (let i = 0; i < l; i++) {
      const typ = typs[i];
      try {
        return transform(val, typ, getProps);
      } catch (_) {}
    }
    return invalidValue(typs, val, key, parent);
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val;
    return invalidValue(
      cases.map((a) => {
        return l(a);
      }),
      val,
      key,
      parent,
    );
  }

  function transformArray(typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue(l('array'), val, key, parent);
    return val.map((el) => transform(el, typ, getProps));
  }

  function transformDate(val: any): any {
    if (val === null) {
      return null;
    }
    const d = new Date(val);
    if (isNaN(d.valueOf())) {
      return invalidValue(l('Date'), val, key, parent);
    }
    return d;
  }

  function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
    if (val === null || typeof val !== 'object' || Array.isArray(val)) {
      return invalidValue(l(ref || 'object'), val, key, parent);
    }
    const result: any = {};
    Object.getOwnPropertyNames(props).forEach((key) => {
      const prop = props[key];
      const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
      result[prop.key] = transform(v, prop.typ, getProps, key, ref);
    });
    Object.getOwnPropertyNames(val).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key, ref);
      }
    });
    return result;
  }

  if (typ === 'any') return val;
  if (typ === null) {
    if (val === null) return val;
    return invalidValue(typ, val, key, parent);
  }
  if (typ === false) return invalidValue(typ, val, key, parent);
  let ref: any = undefined;
  while (typeof typ === 'object' && typ.ref !== undefined) {
    ref = typ.ref;
    typ = typeMap[typ.ref];
  }
  if (Array.isArray(typ)) return transformEnum(typ, val);
  if (typeof typ === 'object') {
    return typ.hasOwnProperty('unionMembers')
      ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty('arrayItems')
      ? transformArray(typ.arrayItems, val)
      : typ.hasOwnProperty('props')
      ? transformObject(getProps(typ), typ.additional, val)
      : invalidValue(typ, val, key, parent);
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== 'number') return transformDate(val);
  return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
  return { literal: typ };
}

function a(typ: any) {
  return { arrayItems: typ };
}

function u(...typs: any[]) {
  return { unionMembers: typs };
}

function o(props: any[], additional: any) {
  return { props, additional };
}

function m(additional: any) {
  return { props: [], additional };
}

function r(name: string) {
  return { ref: name };
}

const typeMap: any = {
  NewSubjectsTypes: o(
    [
      { json: '3EA', js: '3EA', typ: r('The3Ea') },
      { json: 'SN', js: 'SN', typ: r('Sn') },
      { json: 'MF2E', js: 'MF2E', typ: r('Mf2E') },
    ],
    false,
  ),
  The3Ea: o(
    [
      { json: '1A', js: '1A', typ: r('The3Ea1A') },
      { json: '2A', js: '2A', typ: r('The3Ea2A') },
      { json: '3A', js: '3A', typ: r('The3Ea3A') },
    ],
    false,
  ),
  The3Ea1A: o(
    [
      { json: 'FISA', js: 'FISA', typ: r('PurpleFISA') },
      { json: 'FISE', js: 'FISE', typ: r('PurpleFISE') },
    ],
    false,
  ),
  PurpleFISA: o([{ json: '(*)', js: '(*)', typ: r('Purple') }], false),
  Purple: o(
    [
      { json: 'N5AE01A', js: 'N5AE01A', typ: '' },
      { json: 'N5AE01B', js: 'N5AE01B', typ: '' },
      { json: 'N5AE02A', js: 'N5AE02A', typ: '' },
      { json: 'N5AE02B', js: 'N5AE02B', typ: '' },
      { json: 'N5AE03A', js: 'N5AE03A', typ: '' },
      { json: 'N5AE03B', js: 'N5AE03B', typ: '' },
      { json: 'N5AE03C', js: 'N5AE03C', typ: '' },
      { json: 'N5AE03D', js: 'N5AE03D', typ: '' },
      { json: 'N5AE04A', js: 'N5AE04A', typ: '' },
      { json: 'N5AE04B', js: 'N5AE04B', typ: '' },
      { json: 'N5AE04C', js: 'N5AE04C', typ: '' },
      { json: 'N5AE04D', js: 'N5AE04D', typ: '' },
      { json: 'N6AE01A', js: 'N6AE01A', typ: '' },
      { json: 'N6AE01B', js: 'N6AE01B', typ: '' },
      { json: 'N6AE01C', js: 'N6AE01C', typ: '' },
      { json: 'N6AE02A', js: 'N6AE02A', typ: '' },
      { json: 'N6AE02B', js: 'N6AE02B', typ: '' },
      { json: 'N6AE02C', js: 'N6AE02C', typ: '' },
      { json: 'N6AE03A', js: 'N6AE03A', typ: '' },
      { json: 'N6AE03B', js: 'N6AE03B', typ: '' },
      { json: 'N6AE03C', js: 'N6AE03C', typ: '' },
      { json: 'N6AE04A', js: 'N6AE04A', typ: '' },
      { json: 'N6AE04B', js: 'N6AE04B', typ: '' },
      { json: 'N6AE04C', js: 'N6AE04C', typ: '' },
      { json: 'N6AE04D', js: 'N6AE04D', typ: '' },
    ],
    false,
  ),
  PurpleFISE: o(
    [
      { json: '(*)', js: '(*)', typ: r('FISEClass') },
      { json: 'Objets connectés', js: 'Objets connectés', typ: r('ObjetsConnectés') },
      { json: 'Avion plus électrique', js: 'Avion plus électrique', typ: r('AvionPlusÉlectrique') },
      {
        json: 'Introduction aux télécommunications',
        js: 'Introduction aux télécommunications',
        typ: r('IntroductionAuxTélécommunications'),
      },
    ],
    false,
  ),
  FISEClass: o(
    [
      { json: 'N5EE01', js: 'N5EE01', typ: '' },
      { json: 'N5EE01A', js: 'N5EE01A', typ: '' },
      { json: 'N5EE01B', js: 'N5EE01B', typ: '' },
      { json: 'N5EE01C', js: 'N5EE01C', typ: '' },
      { json: 'N5EE02', js: 'N5EE02', typ: '' },
      { json: 'N5EE02A', js: 'N5EE02A', typ: '' },
      { json: 'N5EE02B', js: 'N5EE02B', typ: '' },
      { json: 'N5EE03', js: 'N5EE03', typ: '' },
      { json: 'N5EE03A', js: 'N5EE03A', typ: '' },
      { json: 'N5EE03B', js: 'N5EE03B', typ: '' },
      { json: 'N5EE03C', js: 'N5EE03C', typ: '' },
      { json: 'N5EE04', js: 'N5EE04', typ: '' },
      { json: 'N5EE04A', js: 'N5EE04A', typ: '' },
      { json: 'N5EE04B', js: 'N5EE04B', typ: '' },
      { json: 'N5EE04C', js: 'N5EE04C', typ: '' },
      { json: 'N5EE05', js: 'N5EE05', typ: '' },
      { json: 'N5EE05A1', js: 'N5EE05A1', typ: '' },
      { json: 'N5EE05A2', js: 'N5EE05A2', typ: '' },
      { json: 'N5EE05B', js: 'N5EE05B', typ: '' },
      { json: 'N5EE05C', js: 'N5EE05C', typ: '' },
      { json: 'N6EE01', js: 'N6EE01', typ: '' },
      { json: 'N6EE01A', js: 'N6EE01A', typ: '' },
      { json: 'N6EE01B', js: 'N6EE01B', typ: '' },
      { json: 'N6EE01C', js: 'N6EE01C', typ: '' },
      { json: 'N6EE02', js: 'N6EE02', typ: '' },
      { json: 'N6EE02A', js: 'N6EE02A', typ: '' },
      { json: 'N6EE02B', js: 'N6EE02B', typ: '' },
      { json: 'N6EE02C', js: 'N6EE02C', typ: '' },
      { json: 'N6EE03', js: 'N6EE03', typ: '' },
      { json: 'N6EE03A', js: 'N6EE03A', typ: '' },
      { json: 'N6EE03B', js: 'N6EE03B', typ: '' },
      { json: 'N6EE03C', js: 'N6EE03C', typ: '' },
      { json: 'N6EE03D', js: 'N6EE03D', typ: '' },
      { json: 'N6EE04', js: 'N6EE04', typ: '' },
      { json: 'N6EE04A', js: 'N6EE04A', typ: '' },
      { json: 'N6EE04B', js: 'N6EE04B', typ: '' },
      { json: 'N6EE04C', js: 'N6EE04C', typ: '' },
      { json: 'N6EE04D', js: 'N6EE04D', typ: '' },
    ],
    false,
  ),
  AvionPlusÉlectrique: o(
    [
      { json: 'N6EE06A', js: 'N6EE06A', typ: '' },
      { json: 'N6EE06B', js: 'N6EE06B', typ: '' },
      { json: 'N6EE06C', js: 'N6EE06C', typ: '' },
    ],
    false,
  ),
  IntroductionAuxTélécommunications: o(
    [
      { json: 'N6EE07A', js: 'N6EE07A', typ: '' },
      { json: 'N6EE07B', js: 'N6EE07B', typ: '' },
    ],
    false,
  ),
  ObjetsConnectés: o(
    [
      { json: 'PRJOC2', js: 'PRJOC2', typ: '' },
      { json: 'PRJOC3', js: 'PRJOC3', typ: '' },
      { json: 'PRJOC4', js: 'PRJOC4', typ: '' },
      { json: 'PRJOC5', js: 'PRJOC5', typ: '' },
    ],
    false,
  ),
  The3Ea2A: o(
    [
      { json: 'FISA', js: 'FISA', typ: r('FluffyFISA') },
      { json: 'FISE', js: 'FISE', typ: r('FluffyFISE') },
    ],
    false,
  ),
  FluffyFISA: o(
    [
      { json: '(*)', js: '(*)', typ: r('Fluffy') },
      { json: 'EN', js: 'EN', typ: r('En') },
      { json: 'GEA', js: 'GEA', typ: r('Gea') },
    ],
    false,
  ),
  Fluffy: o(
    [
      { json: 'N7AE01', js: 'N7AE01', typ: '' },
      { json: 'N7AE01A', js: 'N7AE01A', typ: '' },
      { json: 'N7AE01B', js: 'N7AE01B', typ: '' },
      { json: 'N7AE01C', js: 'N7AE01C', typ: '' },
      { json: 'N7AE07', js: 'N7AE07', typ: '' },
      { json: 'N7AE07A', js: 'N7AE07A', typ: '' },
      { json: 'N7AE07B', js: 'N7AE07B', typ: '' },
      { json: 'N7AE03', js: 'N7AE03', typ: '' },
      { json: 'N7AE03A', js: 'N7AE03A', typ: '' },
      { json: 'N7AE03B', js: 'N7AE03B', typ: '' },
      { json: 'N7AE03C', js: 'N7AE03C', typ: '' },
      { json: 'NA7AE05', js: 'NA7AE05', typ: '' },
    ],
    false,
  ),
  En: o(
    [
      { json: 'N7AE04', js: 'N7AE04', typ: '' },
      { json: 'N7AE04A', js: 'N7AE04A', typ: '' },
      { json: 'N7AE04B', js: 'N7AE04B', typ: '' },
      { json: 'N7AE04D', js: 'N7AE04D', typ: '' },
      { json: 'N8AE01', js: 'N8AE01', typ: '' },
      { json: 'N8AE01A', js: 'N8AE01A', typ: '' },
      { json: 'N8AE01B', js: 'N8AE01B', typ: '' },
      { json: 'N8AE01C', js: 'N8AE01C', typ: '' },
      { json: 'N8AE10', js: 'N8AE10', typ: '' },
      { json: 'N8AE03A', js: 'N8AE03A', typ: '' },
      { json: 'N8AE03B', js: 'N8AE03B', typ: '' },
      { json: 'N8AE09A', js: 'N8AE09A', typ: '' },
      { json: 'N8AE11', js: 'N8AE11', typ: '' },
      { json: 'N8AE11A', js: 'N8AE11A', typ: '' },
      { json: 'N8AE03C', js: 'N8AE03C', typ: '' },
      { json: 'N8AE11B', js: 'N8AE11B', typ: '' },
      { json: 'N8AE11C', js: 'N8AE11C', typ: '' },
      { json: 'N8AE12', js: 'N8AE12', typ: '' },
      { json: 'N8AE12A', js: 'N8AE12A', typ: '' },
      { json: 'N8AE12B', js: 'N8AE12B', typ: '' },
      { json: 'N8AE12C', js: 'N8AE12C', typ: '' },
    ],
    false,
  ),
  Gea: o(
    [
      { json: 'N7AE08', js: 'N7AE08', typ: '' },
      { json: 'N7AE08A', js: 'N7AE08A', typ: '' },
      { json: 'N7AE08B', js: 'N7AE08B', typ: '' },
      { json: 'N7AE08C', js: 'N7AE08C', typ: '' },
      { json: 'N8AE17', js: 'N8AE17', typ: '' },
      { json: 'N8AE13C', js: 'N8AE13C', typ: '' },
      { json: 'N8AE17A', js: 'N8AE17A', typ: '' },
      { json: 'N8AE14', js: 'N8AE14', typ: '' },
      { json: 'N8AE14A', js: 'N8AE14A', typ: '' },
      { json: 'N8AE05B', js: 'N8AE05B', typ: '' },
      { json: 'N8AE08A', js: 'N8AE08A', typ: '' },
      { json: 'N8AE05', js: 'N8AE05', typ: '' },
      { json: 'N8AE15', js: 'N8AE15', typ: '' },
      { json: 'N8AE15A', js: 'N8AE15A', typ: '' },
      { json: 'N8AE15B', js: 'N8AE15B', typ: '' },
      { json: 'N8AE16', js: 'N8AE16', typ: '' },
      { json: 'N8AE16A', js: 'N8AE16A', typ: '' },
      { json: 'N8AE16B', js: 'N8AE16B', typ: '' },
      { json: 'N8AE16C', js: 'N8AE16C', typ: '' },
    ],
    false,
  ),
  FluffyFISE: o(
    [
      { json: 'Énergie', js: 'Énergie', typ: r('Énergie') },
      { json: 'Électronique', js: 'Électronique', typ: r('Électronique') },
      {
        json: 'Électronique Énergie Électrique et Simulation (EEES)',
        js: 'Électronique Énergie Électrique et Simulation (EEES)',
        typ: r('ÉlectroniqueÉnergieÉlectriqueEtSimulationEEES'),
      },
      { json: 'InSYS', js: 'InSYS', typ: r('FISEInSYS') },
      { json: 'SysCom', js: 'SysCom', typ: r('FISESysCOM') },
      { json: 'SATR', js: 'SATR', typ: r('Satr') },
      { json: 'SM', js: 'SM', typ: r('Sm') },
      { json: 'PN', js: 'PN', typ: r('FisePn') },
      { json: 'IATI', js: 'IATI', typ: r('Iati') },
    ],
    false,
  ),
  Iati: o(
    [
      { json: 'N8EE22', js: 'N8EE22', typ: '' },
      { json: 'N8EE06B', js: 'N8EE06B', typ: '' },
      { json: 'N8EE06C', js: 'N8EE06C', typ: '' },
      { json: 'N8EE22C', js: 'N8EE22C', typ: '' },
      { json: 'N8EE028', js: 'N8EE028', typ: '' },
      { json: 'N8EE03A', js: 'N8EE03A', typ: '' },
      { json: 'N8EE03C', js: 'N8EE03C', typ: '' },
      { json: 'N8EE03D', js: 'N8EE03D', typ: '' },
      { json: 'N8EE29', js: 'N8EE29', typ: '' },
      { json: 'N8EE29A', js: 'N8EE29A', typ: '' },
      { json: 'N8EE29B', js: 'N8EE29B', typ: '' },
      { json: 'N8EE29C', js: 'N8EE29C', typ: '' },
      { json: 'N8EE30', js: 'N8EE30', typ: '' },
      { json: 'N8EE30A', js: 'N8EE30A', typ: '' },
      { json: 'N8EE30B', js: 'N8EE30B', typ: '' },
      { json: 'N8EE30C', js: 'N8EE30C', typ: '' },
      { json: 'N8EE30D', js: 'N8EE30D', typ: '' },
      { json: 'N8EE31', js: 'N8EE31', typ: '' },
      { json: 'N8EE32', js: 'N8EE32', typ: '' },
      { json: 'N8EE32A', js: 'N8EE32A', typ: '' },
      { json: 'N8EE32B', js: 'N8EE32B', typ: '' },
      { json: 'N8EE32C', js: 'N8EE32C', typ: '' },
      { json: 'N8EE32D', js: 'N8EE32D', typ: '' },
      { json: 'N8EE33A', js: 'N8EE33A', typ: '' },
      { json: 'N8EE33B', js: 'N8EE33B', typ: '' },
    ],
    false,
  ),
  FISEInSYS: o(
    [
      { json: 'N8EE01', js: 'N8EE01', typ: '' },
      { json: 'N8EE01A', js: 'N8EE01A', typ: '' },
      { json: 'N8EE02', js: 'N8EE02', typ: '' },
      { json: 'N8EE02A', js: 'N8EE02A', typ: '' },
      { json: 'N8EE02B', js: 'N8EE02B', typ: '' },
      { json: 'N8EE04A', js: 'N8EE04A', typ: '' },
      { json: 'N8EE02D', js: 'N8EE02D', typ: '' },
      { json: 'N8EE03', js: 'N8EE03', typ: '' },
      { json: 'N8EE03A', js: 'N8EE03A', typ: '' },
      { json: 'N8EE03C', js: 'N8EE03C', typ: '' },
      { json: 'N8EE03F', js: 'N8EE03F', typ: '' },
      { json: 'N8EE04', js: 'N8EE04', typ: '' },
      { json: 'N8EE02C', js: 'N8EE02C', typ: '' },
      { json: 'N8EE04B', js: 'N8EE04B', typ: '' },
      { json: 'N8EE04D', js: 'N8EE04D', typ: '' },
      { json: 'N8EE05', js: 'N8EE05', typ: '' },
      { json: 'N8EE05A', js: 'N8EE05A', typ: '' },
      { json: 'N8EE05B', js: 'N8EE05B', typ: '' },
    ],
    false,
  ),
  FisePn: o(
    [
      { json: 'N8EE36', js: 'N8EE36', typ: '' },
      { json: 'N8EE20A', js: 'N8EE20A', typ: '' },
      { json: 'N8EE20C', js: 'N8EE20C', typ: '' },
      { json: 'N8EE21C', js: 'N8EE21C', typ: '' },
      { json: 'N8EE21E', js: 'N8EE21E', typ: '' },
      { json: 'N8EE27', js: 'N8EE27', typ: '' },
      { json: 'N8EE27A', js: 'N8EE27A', typ: '' },
      { json: 'N8EE09D', js: 'N8EE09D', typ: '' },
      { json: 'N8EE11', js: 'N8EE11', typ: '' },
      { json: 'N8EE11A', js: 'N8EE11A', typ: '' },
      { json: 'N8EE11C', js: 'N8EE11C', typ: '' },
      { json: 'N8EE22B', js: 'N8EE22B', typ: '' },
      { json: 'N8EE21B', js: 'N8EE21B', typ: '' },
      { json: 'N8EE22A', js: 'N8EE22A', typ: '' },
      { json: 'N8EE26', js: 'N8EE26', typ: '' },
      { json: 'N8EE26A', js: 'N8EE26A', typ: '' },
      { json: 'N8EE07E', js: 'N8EE07E', typ: '' },
      { json: 'N8EE07F', js: 'N8EE07F', typ: '' },
      { json: 'N8EE22', js: 'N8EE22', typ: '' },
      { json: 'N8EE06B', js: 'N8EE06B', typ: '' },
      { json: 'N8EE06C', js: 'N8EE06C', typ: '' },
      { json: 'N8EE22C', js: 'N8EE22C', typ: '' },
    ],
    false,
  ),
  Satr: o(
    [
      { json: 'N8EE13', js: 'N8EE13', typ: '' },
      { json: 'N8EE13A', js: 'N8EE13A', typ: '' },
      { json: 'N8EE13B', js: 'N8EE13B', typ: '' },
      { json: 'N8EE13C', js: 'N8EE13C', typ: '' },
      { json: 'N8EE13D', js: 'N8EE13D', typ: '' },
      { json: 'N8EE14', js: 'N8EE14', typ: '' },
      { json: 'N8EE14A', js: 'N8EE14A', typ: '' },
      { json: 'N8EE14B', js: 'N8EE14B', typ: '' },
      { json: 'N8EE14C', js: 'N8EE14C', typ: '' },
      { json: 'N8EE14D', js: 'N8EE14D', typ: '' },
      { json: 'N8EE15', js: 'N8EE15', typ: '' },
      { json: 'N8EE15A', js: 'N8EE15A', typ: '' },
      { json: 'N8EE15C', js: 'N8EE15C', typ: '' },
      { json: 'N8EE15D', js: 'N8EE15D', typ: '' },
      { json: 'N8EE15E', js: 'N8EE15E', typ: '' },
      { json: 'N8EE16', js: 'N8EE16', typ: '' },
      { json: 'N8EE16A', js: 'N8EE16A', typ: '' },
      { json: 'N8EE16B', js: 'N8EE16B', typ: '' },
      { json: 'N8EE16C', js: 'N8EE16C', typ: '' },
      { json: 'N8EE16D', js: 'N8EE16D', typ: '' },
      { json: 'N8EE16E', js: 'N8EE16E', typ: '' },
      { json: 'N8EE17', js: 'N8EE17', typ: '' },
      { json: 'N8EE17A', js: 'N8EE17A', typ: '' },
      { json: 'N8EE17B', js: 'N8EE17B', typ: '' },
      { json: 'N8EE17C', js: 'N8EE17C', typ: '' },
    ],
    false,
  ),
  Sm: o(
    [
      { json: 'N8EE13', js: 'N8EE13', typ: '' },
      { json: 'N8EE13A', js: 'N8EE13A', typ: '' },
      { json: 'N8EE13B', js: 'N8EE13B', typ: '' },
      { json: 'N8EE13C', js: 'N8EE13C', typ: '' },
      { json: 'N8EE13D', js: 'N8EE13D', typ: '' },
      { json: 'N8EE14', js: 'N8EE14', typ: '' },
      { json: 'N8EE14A', js: 'N8EE14A', typ: '' },
      { json: 'N8EE14B', js: 'N8EE14B', typ: '' },
      { json: 'N8EE14C', js: 'N8EE14C', typ: '' },
      { json: 'N8EE14D', js: 'N8EE14D', typ: '' },
      { json: 'N8EE15', js: 'N8EE15', typ: '' },
      { json: 'N8EE15A', js: 'N8EE15A', typ: '' },
      { json: 'N8EE15C', js: 'N8EE15C', typ: '' },
      { json: 'N8EE15D', js: 'N8EE15D', typ: '' },
      { json: 'N8EE15E', js: 'N8EE15E', typ: '' },
      { json: 'N8EE24', js: 'N8EE24', typ: '' },
      { json: 'N8EE20A', js: 'N8EE20A', typ: '' },
      { json: 'N8EE20C', js: 'N8EE20C', typ: '' },
      { json: 'N8EE20D', js: 'N8EE20D', typ: '' },
      { json: 'N8EE24A', js: 'N8EE24A', typ: '' },
      { json: 'N8EE25', js: 'N8EE25', typ: '' },
      { json: 'N8EE21A', js: 'N8EE21A', typ: '' },
      { json: 'N8EE21B', js: 'N8EE21B', typ: '' },
      { json: 'N8EE21C', js: 'N8EE21C', typ: '' },
      { json: 'N8EE21E', js: 'N8EE21E', typ: '' },
    ],
    false,
  ),
  FISESysCOM: o(
    [
      { json: 'N8EE22', js: 'N8EE22', typ: '' },
      { json: 'N8EE06B', js: 'N8EE06B', typ: '' },
      { json: 'N8EE06C', js: 'N8EE06C', typ: '' },
      { json: 'N8EE22C', js: 'N8EE22C', typ: '' },
      { json: 'N8EE26', js: 'N8EE26', typ: '' },
      { json: 'N8EE26A', js: 'N8EE26A', typ: '' },
      { json: 'N8EE07E', js: 'N8EE07E', typ: '' },
      { json: 'N8EE07F', js: 'N8EE07F', typ: '' },
      { json: 'N8EE23', js: 'N8EE23', typ: '' },
      { json: 'N8EE08B', js: 'N8EE08B', typ: '' },
      { json: 'N8EE04A', js: 'N8EE04A', typ: '' },
      { json: 'N8EE23B', js: 'N8EE23B', typ: '' },
      { json: 'N8EE34', js: 'N8EE34', typ: '' },
      { json: 'N8EE22A', js: 'N8EE22A', typ: '' },
      { json: 'N8EE22B', js: 'N8EE22B', typ: '' },
      { json: 'N8EE04B', js: 'N8EE04B', typ: '' },
      { json: 'N8EE04D', js: 'N8EE04D', typ: '' },
      { json: 'N8EE05', js: 'N8EE05', typ: '' },
      { json: 'N8EE05A', js: 'N8EE05A', typ: '' },
      { json: 'N8EE05B', js: 'N8EE05B', typ: '' },
    ],
    false,
  ),
  Électronique: o(
    [
      { json: 'N7EE06', js: 'N7EE06', typ: '' },
      { json: 'N7EE06A', js: 'N7EE06A', typ: '' },
      { json: 'N7EE06B', js: 'N7EE06B', typ: '' },
      { json: 'N7EE06C', js: 'N7EE06C', typ: '' },
      { json: 'N7EE06D', js: 'N7EE06D', typ: '' },
      { json: 'N7EE07', js: 'N7EE07', typ: '' },
      { json: 'N7EE07B', js: 'N7EE07B', typ: '' },
      { json: 'N7EE07C', js: 'N7EE07C', typ: '' },
      { json: 'N7EE08', js: 'N7EE08', typ: '' },
      { json: 'N7EE08A', js: 'N7EE08A', typ: '' },
      { json: 'N7EE08B', js: 'N7EE08B', typ: '' },
      { json: 'N7EE09', js: 'N7EE09', typ: '' },
      { json: 'N7EE09A', js: 'N7EE09A', typ: '' },
      { json: 'N7EE09B', js: 'N7EE09B', typ: '' },
      { json: 'N7EE09D', js: 'N7EE09D', typ: '' },
      { json: 'N7EE10', js: 'N7EE10', typ: '' },
      { json: 'N7EE10A', js: 'N7EE10A', typ: '' },
      { json: 'N7EE10B', js: 'N7EE10B', typ: '' },
      { json: 'N7EE10C', js: 'N7EE10C', typ: '' },
    ],
    false,
  ),
  ÉlectroniqueÉnergieÉlectriqueEtSimulationEEES: o(
    [
      { json: 'N7EE09', js: 'N7EE09', typ: '' },
      { json: 'N7EE09A', js: 'N7EE09A', typ: '' },
      { json: 'N7EE09B', js: 'N7EE09B', typ: '' },
      { json: 'N7EE09D', js: 'N7EE09D', typ: '' },
      { json: 'N7EE13', js: 'N7EE13', typ: '' },
      { json: 'N7EE06C', js: 'N7EE06C', typ: '' },
      { json: 'N7EE10B', js: 'N7EE10B', typ: '' },
      { json: 'N7EE13A', js: 'N7EE13A', typ: '' },
      { json: 'N7EE14', js: 'N7EE14', typ: '' },
      { json: 'N7EE10A', js: 'N7EE10A', typ: '' },
      { json: 'N7EM04B', js: 'N7EM04B', typ: '' },
      { json: 'N7EE15', js: 'N7EE15', typ: '' },
      { json: 'N7EE15A', js: 'N7EE15A', typ: '' },
      { json: 'N7EE03E', js: 'N7EE03E', typ: '' },
      { json: 'N7EE03F', js: 'N7EE03F', typ: '' },
      { json: 'N7EE16', js: 'N7EE16', typ: '' },
      { json: 'N7EE03B', js: 'N7EE03B', typ: '' },
      { json: 'N7EE16A', js: 'N7EE16A', typ: '' },
    ],
    false,
  ),
  Énergie: o(
    [
      { json: 'N7EE01', js: 'N7EE01', typ: '' },
      { json: 'N7EE01A', js: 'N7EE01A', typ: '' },
      { json: 'N7EE01B', js: 'N7EE01B', typ: '' },
      { json: 'N7EE01C', js: 'N7EE01C', typ: '' },
      { json: 'N7EE02', js: 'N7EE02', typ: '' },
      { json: 'N7EE02A', js: 'N7EE02A', typ: '' },
      { json: 'N7EE02B', js: 'N7EE02B', typ: '' },
      { json: 'N7EE03', js: 'N7EE03', typ: '' },
      { json: 'N7EE03B', js: 'N7EE03B', typ: '' },
      { json: 'N7EE03E', js: 'N7EE03E', typ: '' },
      { json: 'N7EE03F', js: 'N7EE03F', typ: '' },
      { json: 'N7EE04', js: 'N7EE04', typ: '' },
      { json: 'N7EE04A', js: 'N7EE04A', typ: '' },
      { json: 'N7EE04B', js: 'N7EE04B', typ: '' },
      { json: 'N7EE04C', js: 'N7EE04C', typ: '' },
      { json: 'N7EE04D', js: 'N7EE04D', typ: '' },
      { json: 'N7EE05', js: 'N7EE05', typ: '' },
      { json: 'N7EE05A', js: 'N7EE05A', typ: '' },
      { json: 'N7EE05B', js: 'N7EE05B', typ: '' },
      { json: 'N7EE05C', js: 'N7EE05C', typ: '' },
      { json: 'N7EE05D', js: 'N7EE05D', typ: '' },
    ],
    false,
  ),
  The3Ea3A: o([{ json: '(*)', js: '(*)', typ: r('Tentacled') }], false),
  Tentacled: o(
    [
      { json: 'InSYS', js: 'InSYS', typ: r('InSYS') },
      { json: 'SysCom', js: 'SysCom', typ: r('SysCOM') },
      { json: 'ACISE', js: 'ACISE', typ: r('Acise') },
      { json: 'CERE', js: 'CERE', typ: r('Cere') },
      { json: 'EMA', js: 'EMA', typ: r('Ema') },
      { json: 'PN', js: 'PN', typ: r('Pn') },
      { json: 'Éco-Énergie', js: 'Éco-Énergie', typ: r('ÉcoÉnergie') },
    ],
    false,
  ),
  Acise: o(
    [
      { json: 'N9EE16', js: 'N9EE16', typ: '' },
      { json: 'N9EE16A', js: 'N9EE16A', typ: '' },
      { json: 'N9EE16B', js: 'N9EE16B', typ: '' },
      { json: 'N9EE16C', js: 'N9EE16C', typ: '' },
      { json: 'N9EE17', js: 'N9EE17', typ: '' },
      { json: 'N9EE17A', js: 'N9EE17A', typ: '' },
      { json: 'N9EE17B', js: 'N9EE17B', typ: '' },
      { json: 'N9EE17C', js: 'N9EE17C', typ: '' },
      { json: 'N9EE17D', js: 'N9EE17D', typ: '' },
      { json: 'N9EE17E', js: 'N9EE17E', typ: '' },
      { json: 'N9EE17F', js: 'N9EE17F', typ: '' },
      { json: 'N9EE18', js: 'N9EE18', typ: '' },
      { json: 'N9EE18A', js: 'N9EE18A', typ: '' },
      { json: 'N9EE18B', js: 'N9EE18B', typ: '' },
      { json: 'N9EE18C', js: 'N9EE18C', typ: '' },
      { json: 'N9EE18D', js: 'N9EE18D', typ: '' },
      { json: 'N9EE18E', js: 'N9EE18E', typ: '' },
      { json: 'N9EE19', js: 'N9EE19', typ: '' },
      { json: 'N9EE19A', js: 'N9EE19A', typ: '' },
      { json: 'N9EE19B', js: 'N9EE19B', typ: '' },
      { json: 'N9EE19C', js: 'N9EE19C', typ: '' },
      { json: 'N9EE19D', js: 'N9EE19D', typ: '' },
      { json: 'N9EE19E', js: 'N9EE19E', typ: '' },
      { json: 'N9EE20', js: 'N9EE20', typ: '' },
      { json: 'N9EE20A', js: 'N9EE20A', typ: '' },
      { json: 'N9EE20B', js: 'N9EE20B', typ: '' },
      { json: 'N9EE20C', js: 'N9EE20C', typ: '' },
      { json: 'N9EE20D', js: 'N9EE20D', typ: '' },
      { json: 'N9EK01C', js: 'N9EK01C', typ: '' },
    ],
    false,
  ),
  Cere: o(
    [
      { json: 'N9EE21', js: 'N9EE21', typ: '' },
      { json: 'N9EE21A', js: 'N9EE21A', typ: '' },
      { json: 'N9EE21B', js: 'N9EE21B', typ: '' },
      { json: 'N9EE21C', js: 'N9EE21C', typ: '' },
      { json: 'N9EE22', js: 'N9EE22', typ: '' },
      { json: 'N9EE22A', js: 'N9EE22A', typ: '' },
      { json: 'N9EE22B', js: 'N9EE22B', typ: '' },
      { json: 'N9EE22C', js: 'N9EE22C', typ: '' },
      { json: 'N9EE22D', js: 'N9EE22D', typ: '' },
      { json: 'N9EE23', js: 'N9EE23', typ: '' },
      { json: 'N9EE23A', js: 'N9EE23A', typ: '' },
      { json: 'N9EE23B', js: 'N9EE23B', typ: '' },
      { json: 'N9EE23C', js: 'N9EE23C', typ: '' },
      { json: 'N9EE23D', js: 'N9EE23D', typ: '' },
      { json: 'N9EE24', js: 'N9EE24', typ: '' },
      { json: 'N9EE24B', js: 'N9EE24B', typ: '' },
      { json: 'N9EE24C', js: 'N9EE24C', typ: '' },
      { json: 'N9EE16C', js: 'N9EE16C', typ: '' },
      { json: 'N9EE24D', js: 'N9EE24D', typ: '' },
      { json: 'N9EE25', js: 'N9EE25', typ: '' },
      { json: 'N9EE25A', js: 'N9EE25A', typ: '' },
      { json: 'N9EE25B', js: 'N9EE25B', typ: '' },
      { json: 'N9EE25C', js: 'N9EE25C', typ: '' },
      { json: 'N9EE25D', js: 'N9EE25D', typ: '' },
      { json: 'N9EK01C', js: 'N9EK01C', typ: '' },
    ],
    false,
  ),
  Ema: o(
    [
      { json: 'N9EE26', js: 'N9EE26', typ: '' },
      { json: 'N9EE26B', js: 'N9EE26B', typ: '' },
      { json: 'N9EE26C', js: 'N9EE26C', typ: '' },
      { json: 'N9EE26D', js: 'N9EE26D', typ: '' },
      { json: 'N9EE27', js: 'N9EE27', typ: '' },
      { json: 'N9EE27A', js: 'N9EE27A', typ: '' },
      { json: 'N9EE27B', js: 'N9EE27B', typ: '' },
      { json: 'N9EE27C', js: 'N9EE27C', typ: '' },
      { json: 'N9EE27D', js: 'N9EE27D', typ: '' },
      { json: 'N9EE28', js: 'N9EE28', typ: '' },
      { json: 'N9EE28B', js: 'N9EE28B', typ: '' },
      { json: 'N9EE28C', js: 'N9EE28C', typ: '' },
      { json: 'N9EE28D', js: 'N9EE28D', typ: '' },
      { json: 'N9EE28E', js: 'N9EE28E', typ: '' },
      { json: 'N9EE29', js: 'N9EE29', typ: '' },
      { json: 'N9EE29A', js: 'N9EE29A', typ: '' },
      { json: 'N9EE29B', js: 'N9EE29B', typ: '' },
      { json: 'N9EE29C', js: 'N9EE29C', typ: '' },
      { json: 'N9EE29D', js: 'N9EE29D', typ: '' },
      { json: 'N9EE16C', js: 'N9EE16C', typ: '' },
      { json: 'N9EE30', js: 'N9EE30', typ: '' },
      { json: 'N9EE30A', js: 'N9EE30A', typ: '' },
      { json: 'N9EE30B', js: 'N9EE30B', typ: '' },
      { json: 'N9EE30D', js: 'N9EE30D', typ: '' },
      { json: 'N9EE16B', js: 'N9EE16B', typ: '' },
      { json: 'N9EK01C', js: 'N9EK01C', typ: '' },
    ],
    false,
  ),
  InSYS: o(
    [
      { json: 'N9EE46', js: 'N9EE46', typ: '' },
      { json: 'N9EE04B', js: 'N9EE04B', typ: '' },
      { json: 'N9EE06C', js: 'N9EE06C', typ: '' },
      { json: 'N9EE46A', js: 'N9EE46A', typ: '' },
      { json: 'N9EE06D', js: 'N9EE06D', typ: '' },
      { json: 'N9EE47', js: 'N9EE47', typ: '' },
      { json: 'N9EE05A', js: 'N9EE05A', typ: '' },
      { json: 'N9EE04A', js: 'N9EE04A', typ: '' },
      { json: 'N9EE05C', js: 'N9EE05C', typ: '' },
      { json: 'N9EE48', js: 'N9EE48', typ: '' },
      { json: 'N9EE06B', js: 'N9EE06B', typ: '' },
      { json: 'N9EE48A', js: 'N9EE48A', typ: '' },
      { json: 'N9EE07A', js: 'N9EE07A', typ: '' },
      { json: 'N9EE48B', js: 'N9EE48B', typ: '' },
      { json: 'N9EEd49', js: 'N9EEd49', typ: '' },
      { json: 'N9EE06A', js: 'N9EE06A', typ: '' },
      { json: 'N9EE07B', js: 'N9EE07B', typ: '' },
      { json: 'N9EE08', js: 'N9EE08', typ: '' },
      { json: 'N9EE08A', js: 'N9EE08A', typ: '' },
      { json: 'N9EE08B', js: 'N9EE08B', typ: '' },
      { json: 'N9EE09', js: 'N9EE09', typ: '' },
      { json: 'N9EE09A', js: 'N9EE09A', typ: '' },
      { json: 'N9EE09B', js: 'N9EE09B', typ: '' },
      { json: 'N9EE09C', js: 'N9EE09C', typ: '' },
      { json: 'N9EE09D', js: 'N9EE09D', typ: '' },
      { json: 'N9EE10', js: 'N9EE10', typ: '' },
      { json: 'N9EE10A', js: 'N9EE10A', typ: '' },
      { json: 'N9EE10B', js: 'N9EE10B', typ: '' },
      { json: 'N9EE10C', js: 'N9EE10C', typ: '' },
      { json: 'N9EK01C', js: 'N9EK01C', typ: '' },
    ],
    false,
  ),
  Pn: o(
    [
      { json: 'N9EM03', js: 'N9EM03', typ: '' },
      { json: 'N9EE54', js: 'N9EE54', typ: '' },
      { json: 'N9EE53A', js: 'N9EE53A', typ: '' },
      { json: 'N9EE15C', js: 'N9EE15C', typ: '' },
      { json: 'N9EE14C', js: 'N9EE14C', typ: '' },
      { json: 'N9EE56', js: 'N9EE56', typ: '' },
      { json: 'N9EE26A', js: 'N9EE26A', typ: '' },
      { json: 'N9EE26B', js: 'N9EE26B', typ: '' },
      { json: 'N9EE26C', js: 'N9EE26C', typ: '' },
      { json: 'N9EE26D', js: 'N9EE26D', typ: '' },
      { json: 'N9EE55', js: 'N9EE55', typ: '' },
      { json: 'N9EE13D', js: 'N9EE13D', typ: '' },
      { json: 'N9EE29C', js: 'N9EE29C', typ: '' },
      { json: 'N9EE33A', js: 'N9EE33A', typ: '' },
      { json: 'N9EE11C', js: 'N9EE11C', typ: '' },
      { json: 'N9EE11B', js: 'N9EE11B', typ: '' },
      { json: 'N9EE33', js: 'N9EE33', typ: '' },
      { json: 'N9EE33C', js: 'N9EE33C', typ: '' },
      { json: 'N9EE27A', js: 'N9EE27A', typ: '' },
      { json: 'N9EE27B', js: 'N9EE27B', typ: '' },
      { json: 'N9EE33D', js: 'N9EE33D', typ: '' },
      { json: 'N9EK01C', js: 'N9EK01C', typ: '' },
    ],
    false,
  ),
  SysCOM: o(
    [
      { json: 'N9EE50', js: 'N9EE50', typ: '' },
      { json: 'N9EE14B', js: 'N9EE14B', typ: '' },
      { json: 'N9EE11B', js: 'N9EE11B', typ: '' },
      { json: 'N9EE14D', js: 'N9EE14D', typ: '' },
      { json: 'N9EE50A', js: 'N9EE50A', typ: '' },
      { json: 'N9EE51', js: 'N9EE51', typ: '' },
      { json: 'N9EE12A', js: 'N9EE12A', typ: '' },
      { json: 'N9EE12B', js: 'N9EE12B', typ: '' },
      { json: 'N9EE06D', js: 'N9EE06D', typ: '' },
      { json: 'N9EE13A', js: 'N9EE13A', typ: '' },
      { json: 'N9EE52', js: 'N9EE52', typ: '' },
      { json: 'N9EE13B', js: 'N9EE13B', typ: '' },
      { json: 'N9EE13C', js: 'N9EE13C', typ: '' },
      { json: 'N9EE13D', js: 'N9EE13D', typ: '' },
      { json: 'N9EE48A', js: 'N9EE48A', typ: '' },
      { json: 'N9EE14A', js: 'N9EE14A', typ: '' },
      { json: 'N9EE13E', js: 'N9EE13E', typ: '' },
      { json: 'N9EE15', js: 'N9EE15', typ: '' },
      { json: 'N9EE15A', js: 'N9EE15A', typ: '' },
      { json: 'N9EE15B', js: 'N9EE15B', typ: '' },
      { json: 'N9EE15C', js: 'N9EE15C', typ: '' },
      { json: 'N9EE15D', js: 'N9EE15D', typ: '' },
      { json: 'N9EE10', js: 'N9EE10', typ: '' },
      { json: 'N9EE10A', js: 'N9EE10A', typ: '' },
      { json: 'N9EE10B', js: 'N9EE10B', typ: '' },
      { json: 'N9EE10C', js: 'N9EE10C', typ: '' },
      { json: 'N9EE53', js: 'N9EE53', typ: '' },
      { json: 'N9EE11C', js: 'N9EE11C', typ: '' },
      { json: 'N9EE53A', js: 'N9EE53A', typ: '' },
      { json: 'N9EE14C', js: 'N9EE14C', typ: '' },
      { json: 'N9EE14E', js: 'N9EE14E', typ: '' },
      { json: 'N9EK01C', js: 'N9EK01C', typ: '' },
    ],
    false,
  ),
  ÉcoÉnergie: o(
    [
      { json: 'HARMO1', js: 'HARMO1', typ: '' },
      { json: 'HARMO2', js: 'HARMO2', typ: '' },
      { json: 'HARMO3', js: 'HARMO3', typ: '' },
      { json: 'N9EE34', js: 'N9EE34', typ: '' },
      { json: 'N9EE35B', js: 'N9EE35B', typ: '' },
      { json: 'N9EE34B', js: 'N9EE34B', typ: '' },
      { json: 'N9EE34C', js: 'N9EE34C', typ: '' },
      { json: 'N9EE34E', js: 'N9EE34E', typ: '' },
      { json: 'N9EE35', js: 'N9EE35', typ: '' },
      { json: 'N9EE35A', js: 'N9EE35A', typ: '' },
      { json: 'N9EE35F', js: 'N9EE35F', typ: '' },
      { json: 'N9EE35G', js: 'N9EE35G', typ: '' },
      { json: 'N9EE35H', js: 'N9EE35H', typ: '' },
      { json: 'N9EE35I', js: 'N9EE35I', typ: '' },
      { json: 'N9EE35D', js: 'N9EE35D', typ: '' },
      { json: 'N9EE35E', js: 'N9EE35E', typ: '' },
      { json: 'N9EE36', js: 'N9EE36', typ: '' },
      { json: 'N9EE36A', js: 'N9EE36A', typ: '' },
      { json: 'N9EE36B', js: 'N9EE36B', typ: '' },
      { json: 'N9EE36C', js: 'N9EE36C', typ: '' },
      { json: 'N9EE36D', js: 'N9EE36D', typ: '' },
      { json: 'N9EE36E', js: 'N9EE36E', typ: '' },
      { json: 'N9EE37', js: 'N9EE37', typ: '' },
      { json: 'N9EK01A', js: 'N9EK01A', typ: '' },
      { json: 'N9EE37A', js: 'N9EE37A', typ: '' },
    ],
    false,
  ),
  Mf2E: o(
    [
      { json: '1A', js: '1A', typ: r('Mf2E1A') },
      { json: '2A', js: '2A', typ: r('Mf2E2A') },
      { json: '3A', js: '3A', typ: r('Mf2E3A') },
    ],
    false,
  ),
  Mf2E1A: o(
    [
      { json: 'FISA', js: 'FISA', typ: r('TentacledFISA') },
      { json: 'FISE', js: 'FISE', typ: r('TentacledFISE') },
    ],
    false,
  ),
  TentacledFISA: o([{ json: '(*)', js: '(*)', typ: a('') }], false),
  TentacledFISE: o([{ json: '(*)', js: '(*)', typ: a(u(r('Sticky'), '')) }], false),
  Sticky: o(
    [
      { json: 'A32', js: 'A32', typ: u(undefined, '') },
      { json: 'A35', js: 'A35', typ: u(undefined, '') },
      { json: 'A52', js: 'A52', typ: u(undefined, '') },
      { json: 'A55', js: 'A55', typ: u(undefined, '') },
      { json: 'A61', js: 'A61', typ: u(undefined, '') },
      { json: 'B32', js: 'B32', typ: u(undefined, '') },
      { json: 'B33', js: 'B33', typ: u(undefined, '') },
      { json: 'B34', js: 'B34', typ: u(undefined, '') },
      { json: 'B35', js: 'B35', typ: u(undefined, '') },
      { json: 'B36', js: 'B36', typ: u(undefined, '') },
      { json: 'N6EM03C', js: 'N6EM03C', typ: u(undefined, '') },
      { json: 'B43', js: 'B43', typ: u(undefined, '') },
      { json: 'B51', js: 'B51', typ: u(undefined, '') },
      { json: 'B52', js: 'B52', typ: u(undefined, '') },
      { json: 'B53', js: 'B53', typ: u(undefined, '') },
      { json: 'B61', js: 'B61', typ: u(undefined, '') },
      { json: 'N5M2A', js: 'N5M2A', typ: u(undefined, '') },
      { json: 'NAH4B', js: 'NAH4B', typ: u(undefined, '') },
      { json: 'NBH4B', js: 'NBH4B', typ: u(undefined, '') },
      { json: 'N6EM02A', js: 'N6EM02A', typ: u(undefined, '') },
      { json: 'NBH10A', js: 'NBH10A', typ: u(undefined, '') },
    ],
    false,
  ),
  Mf2E2A: o([{ json: 'FISE', js: 'FISE', typ: r('StickyFISE') }], false),
  StickyFISE: o([{ json: '(*)', js: '(*)', typ: a(u(r('Indigo'), '')) }], false),
  Indigo: o(
    [
      { json: 'N8EM04A', js: 'N8EM04A', typ: u(undefined, '') },
      { json: 'N8EM04B', js: 'N8EM04B', typ: u(undefined, '') },
      { json: 'NDH4Bbis', js: 'NDH4Bbis', typ: u(undefined, '') },
      { json: 'N8EM04C', js: 'N8EM04C', typ: u(undefined, '') },
      { json: 'N8EM06B', js: 'N8EM06B', typ: u(undefined, '') },
      { json: 'N8EM07A', js: 'N8EM07A', typ: u(undefined, '') },
      { json: 'N8EM07B', js: 'N8EM07B', typ: u(undefined, '') },
      { json: 'N8EM07C', js: 'N8EM07C', typ: u(undefined, '') },
    ],
    false,
  ),
  Mf2E3A: o([{ json: '(*)', js: '(*)', typ: r('Indecent') }], false),
  Indecent: o(
    [
      { json: '(*)', js: '(*)', typ: a(u(m(''), '')) },
      {
        json: 'Mastère Spécialisé Hydraulique',
        js: 'Mastère Spécialisé Hydraulique',
        typ: r('MastèreSpécialiséHydraulique'),
      },
    ],
    false,
  ),
  MastèreSpécialiséHydraulique: o(
    [
      { json: 'MSH001', js: 'MSH001', typ: '' },
      { json: 'MSH002', js: 'MSH002', typ: '' },
      { json: 'MSH003', js: 'MSH003', typ: '' },
      { json: 'A51', js: 'A51', typ: '' },
      { json: 'E21', js: 'E21', typ: '' },
      { json: 'HYE22', js: 'HYE22', typ: '' },
      { json: 'HYE23', js: 'HYE23', typ: '' },
      { json: 'MSH-HYDR', js: 'MSH-HYDR', typ: '' },
      { json: 'TRAI', js: 'TRAI', typ: '' },
      { json: 'EURB', js: 'EURB', typ: '' },
      { json: 'MSH04', js: 'MSH04', typ: '' },
      { json: 'CYCL', js: 'CYCL', typ: '' },
      { json: 'HSOU', js: 'HSOU', typ: '' },
      { json: 'HSTA', js: 'HSTA', typ: '' },
      { json: 'HTRA', js: 'HTRA', typ: '' },
      { json: 'BESZ', js: 'BESZ', typ: '' },
      { json: 'MSOL', js: 'MSOL', typ: '' },
      { json: 'INGO', js: 'INGO', typ: '' },
      { json: 'STRU', js: 'STRU', typ: '' },
      { json: 'IMPA', js: 'IMPA', typ: '' },
      { json: 'TELE', js: 'TELE', typ: '' },
      { json: 'SIGE', js: 'SIGE', typ: '' },
      { json: 'RISP', js: 'RISP', typ: '' },
      { json: 'HLCO', js: 'HLCO', typ: '' },
    ],
    false,
  ),
  Sn: o(
    [
      { json: '1A', js: '1A', typ: r('Sn1A') },
      { json: '2A', js: '2A', typ: r('Sn2A') },
      { json: '3A', js: '3A', typ: r('Sn3A') },
    ],
    false,
  ),
  Sn1A: o(
    [
      { json: 'FISA', js: 'FISA', typ: r('StickyFISA') },
      { json: 'FISE', js: 'FISE', typ: r('IndigoFISE') },
    ],
    false,
  ),
  StickyFISA: o([{ json: '(*)', js: '(*)', typ: a(u(r('Hilarious'), '')) }], false),
  Hilarious: o(
    [
      { json: 'N5AN01A', js: 'N5AN01A', typ: u(undefined, '') },
      { json: 'N5AN01B', js: 'N5AN01B', typ: u(undefined, '') },
    ],
    false,
  ),
  IndigoFISE: o([{ json: '(*)', js: '(*)', typ: a(u(r('Ambitious'), '')) }], false),
  Ambitious: o(
    [
      { json: 'EDP', js: 'EDP', typ: u(undefined, '') },
      { json: 'Intégration', js: 'Intégration', typ: u(undefined, '') },
      { json: 'Archi', js: 'Archi', typ: u(undefined, '') },
      { json: 'PIM', js: 'PIM', typ: u(undefined, '') },
      { json: 'SEC', js: 'SEC', typ: u(undefined, '') },
      { json: 'CS', js: 'CS', typ: u(undefined, '') },
      { json: 'Rézoloco', js: 'Rézoloco', typ: u(undefined, '') },
      { json: 'Télécom', js: 'Télécom', typ: u(undefined, '') },
      { json: 'TS', js: 'TS', typ: u(undefined, '') },
      { json: 'TOB', js: 'TOB', typ: u(undefined, '') },
    ],
    false,
  ),
  Sn2A: o(
    [
      { json: 'FISE', js: 'FISE', typ: r('IndecentFISE') },
      { json: 'FISA', js: 'FISA', typ: r('IndigoFISA') },
    ],
    false,
  ),
  IndigoFISA: o(
    [
      { json: 'ModIA', js: 'ModIA', typ: r('FISAModIA') },
      { json: '(*)', js: '(*)', typ: r('Cunning') },
    ],
    false,
  ),
  Cunning: o(
    [
      { json: 'N7AN01', js: 'N7AN01', typ: '' },
      { json: 'N7AN01A', js: 'N7AN01A', typ: '' },
      { json: 'N7AN01C', js: 'N7AN01C', typ: '' },
      { json: 'N7AN01D', js: 'N7AN01D', typ: '' },
      { json: 'N7AN02', js: 'N7AN02', typ: '' },
      { json: 'N7AN02A', js: 'N7AN02A', typ: '' },
      { json: 'N7AN02B', js: 'N7AN02B', typ: '' },
      { json: 'N7AN03', js: 'N7AN03', typ: '' },
      { json: 'N7AN03A', js: 'N7AN03A', typ: '' },
      { json: 'N7AN03B', js: 'N7AN03B', typ: '' },
      { json: 'N7AN04', js: 'N7AN04', typ: '' },
      { json: 'N7AN04A', js: 'N7AN04A', typ: '' },
      { json: 'N7AN04B', js: 'N7AN04B', typ: '' },
      { json: 'N8AN01', js: 'N8AN01', typ: '' },
      { json: 'N8AN01B', js: 'N8AN01B', typ: '' },
      { json: 'N8AN01C', js: 'N8AN01C', typ: '' },
      { json: 'N8AN02', js: 'N8AN02', typ: '' },
      { json: 'N8AN02A', js: 'N8AN02A', typ: '' },
      { json: 'N8AN02B', js: 'N8AN02B', typ: '' },
      { json: 'N8AN02C', js: 'N8AN02C', typ: '' },
      { json: 'N8AN02D', js: 'N8AN02D', typ: '' },
      { json: 'N8AN03', js: 'N8AN03', typ: '' },
      { json: 'N8AN03A', js: 'N8AN03A', typ: '' },
      { json: 'N8AN03B', js: 'N8AN03B', typ: '' },
    ],
    false,
  ),
  FISAModIA: o(
    [
      { json: 'N8EAN01', js: 'N8EAN01', typ: '' },
      { json: 'N8EAN01A', js: 'N8EAN01A', typ: '' },
      { json: 'N8EAN01B', js: 'N8EAN01B', typ: '' },
      { json: 'N8EAN02', js: 'N8EAN02', typ: '' },
      { json: 'N8EAN02A', js: 'N8EAN02A', typ: '' },
      { json: 'N8EAN03', js: 'N8EAN03', typ: '' },
      { json: 'N8EAN03A', js: 'N8EAN03A', typ: '' },
      { json: 'N8EAN03B', js: 'N8EAN03B', typ: '' },
      { json: 'N8EAN04', js: 'N8EAN04', typ: '' },
      { json: 'N8EAN04A', js: 'N8EAN04A', typ: '' },
    ],
    false,
  ),
  IndecentFISE: o(
    [
      { json: 'ASR', js: 'ASR', typ: r('ASR') },
      { json: 'HPC Big Data', js: 'HPC Big Data', typ: r('HPCBigData') },
      { json: 'Réseau', js: 'Réseau', typ: r('Réseau') },
      { json: 'IMM', js: 'IMM', typ: r('FiseImm') },
      { json: 'Logiciel', js: 'Logiciel', typ: r('FISELogiciel') },
      { json: 'Télécom', js: 'Télécom', typ: r('Télécom') },
    ],
    false,
  ),
  ASR: o(
    [
      { json: 'N7EN05', js: 'N7EN05', typ: '' },
      { json: 'N7EN05A', js: 'N7EN05A', typ: '' },
      { json: 'N7EN05B', js: 'N7EN05B', typ: '' },
      { json: 'N7EN05C', js: 'N7EN05C', typ: '' },
      { json: 'N7EN06', js: 'N7EN06', typ: '' },
      { json: 'N7EN06A', js: 'N7EN06A', typ: '' },
      { json: 'N7EN06B', js: 'N7EN06B', typ: '' },
      { json: 'N7EN07', js: 'N7EN07', typ: '' },
      { json: 'N7EN07A', js: 'N7EN07A', typ: '' },
      { json: 'N7EN08', js: 'N7EN08', typ: '' },
      { json: 'N7EN08A', js: 'N7EN08A', typ: '' },
      { json: 'N7EN08B', js: 'N7EN08B', typ: '' },
      { json: 'N7EN08C', js: 'N7EN08C', typ: '' },
      { json: 'N7EN09', js: 'N7EN09', typ: '' },
      { json: 'N7EN09A', js: 'N7EN09A', typ: '' },
      { json: 'N7EN09B', js: 'N7EN09B', typ: '' },
      { json: 'N7EN09C', js: 'N7EN09C', typ: '' },
      { json: 'N8EN01', js: 'N8EN01', typ: '' },
      { json: 'N8EN01A', js: 'N8EN01A', typ: '' },
      { json: 'N8EN01B', js: 'N8EN01B', typ: '' },
      { json: 'N8EN01C', js: 'N8EN01C', typ: '' },
      { json: 'N8EN01E', js: 'N8EN01E', typ: '' },
      { json: 'N8EN18', js: 'N8EN18', typ: '' },
      { json: 'N8EN18A', js: 'N8EN18A', typ: '' },
      { json: 'N8EN18B', js: 'N8EN18B', typ: '' },
      { json: 'N8EN18C', js: 'N8EN18C', typ: '' },
      { json: 'N8EN18D', js: 'N8EN18D', typ: '' },
      { json: 'N8EN21', js: 'N8EN21', typ: '' },
      { json: 'N8EN21A', js: 'N8EN21A', typ: '' },
      { json: 'N8EN23', js: 'N8EN23', typ: '' },
      { json: 'N8EN23A', js: 'N8EN23A', typ: '' },
      { json: 'N8EN23B', js: 'N8EN23B', typ: '' },
      { json: 'N8EN23C', js: 'N8EN23C', typ: '' },
      { json: 'N8EN25', js: 'N8EN25', typ: '' },
      { json: 'N8EN25A', js: 'N8EN25A', typ: '' },
      { json: 'N8EN25B', js: 'N8EN25B', typ: '' },
      { json: 'N8EN25C', js: 'N8EN25C', typ: '' },
      { json: 'N8EN25D', js: 'N8EN25D', typ: '' },
    ],
    false,
  ),
  HPCBigData: o(
    [
      { json: 'N7EN08', js: 'N7EN08', typ: '' },
      { json: 'N7EN08A', js: 'N7EN08A', typ: '' },
      { json: 'N7EN08B', js: 'N7EN08B', typ: '' },
      { json: 'N7EN08C', js: 'N7EN08C', typ: '' },
      { json: 'N7EN10', js: 'N7EN10', typ: '' },
      { json: 'N7EN10A', js: 'N7EN10A', typ: '' },
      { json: 'N7EN10B', js: 'N7EN10B', typ: '' },
      { json: 'N7EN11', js: 'N7EN11', typ: '' },
      { json: 'N7EN11A', js: 'N7EN11A', typ: '' },
      { json: 'N7EN12', js: 'N7EN12', typ: '' },
      { json: 'N7EN12A', js: 'N7EN12A', typ: '' },
      { json: 'N7EN12B', js: 'N7EN12B', typ: '' },
      { json: 'N7EN16', js: 'N7EN16', typ: '' },
      { json: 'N7EN16A', js: 'N7EN16A', typ: '' },
      { json: 'N7EN16B', js: 'N7EN16B', typ: '' },
      { json: 'N8EN01', js: 'N8EN01', typ: '' },
      { json: 'N8EN01A', js: 'N8EN01A', typ: '' },
      { json: 'N8EN01B', js: 'N8EN01B', typ: '' },
      { json: 'N8EN01C', js: 'N8EN01C', typ: '' },
      { json: 'N8EN01E', js: 'N8EN01E', typ: '' },
      { json: 'N8EN03', js: 'N8EN03', typ: '' },
      { json: 'N8EN03A', js: 'N8EN03A', typ: '' },
      { json: 'N8EN03B', js: 'N8EN03B', typ: '' },
      { json: 'N8EN03C', js: 'N8EN03C', typ: '' },
      { json: 'N8EN05', js: 'N8EN05', typ: '' },
      { json: 'N8EN05A', js: 'N8EN05A', typ: '' },
      { json: 'N8EN05B', js: 'N8EN05B', typ: '' },
      { json: 'N8EN06', js: 'N8EN06', typ: '' },
      { json: 'N8EN06A', js: 'N8EN06A', typ: '' },
      { json: 'N8EN06B', js: 'N8EN06B', typ: '' },
      { json: 'N8EN07', js: 'N8EN07', typ: '' },
      { json: 'N8EN07A', js: 'N8EN07A', typ: '' },
      { json: 'N8EN07B', js: 'N8EN07B', typ: '' },
    ],
    false,
  ),
  FiseImm: o(
    [
      { json: 'N7EN08', js: 'N7EN08', typ: '' },
      { json: 'N7EN08A', js: 'N7EN08A', typ: '' },
      { json: 'N7EN08B', js: 'N7EN08B', typ: '' },
      { json: 'N7EN08C', js: 'N7EN08C', typ: '' },
      { json: 'N7EN09', js: 'N7EN09', typ: '' },
      { json: 'N7EN09A', js: 'N7EN09A', typ: '' },
      { json: 'N7EN09B', js: 'N7EN09B', typ: '' },
      { json: 'N7EN09C', js: 'N7EN09C', typ: '' },
      { json: 'N7EN10', js: 'N7EN10', typ: '' },
      { json: 'N7EN10A', js: 'N7EN10A', typ: '' },
      { json: 'N7EN10B', js: 'N7EN10B', typ: '' },
      { json: 'N7EN11', js: 'N7EN11', typ: '' },
      { json: 'N7EN11A', js: 'N7EN11A', typ: '' },
      { json: 'N7EN12', js: 'N7EN12', typ: '' },
      { json: 'N7EN12A', js: 'N7EN12A', typ: '' },
      { json: 'N7EN12B', js: 'N7EN12B', typ: '' },
      { json: 'N8EN01', js: 'N8EN01', typ: '' },
      { json: 'N8EN01A', js: 'N8EN01A', typ: '' },
      { json: 'N8EN01B', js: 'N8EN01B', typ: '' },
      { json: 'N8EN01C', js: 'N8EN01C', typ: '' },
      { json: 'N8EN01E', js: 'N8EN01E', typ: '' },
      { json: 'N8EN04', js: 'N8EN04', typ: '' },
      { json: 'N8EN04A', js: 'N8EN04A', typ: '' },
      { json: 'N8EN06', js: 'N8EN06', typ: '' },
      { json: 'N8EN06A', js: 'N8EN06A', typ: '' },
      { json: 'N8EN06B', js: 'N8EN06B', typ: '' },
      { json: 'N8EN11', js: 'N8EN11', typ: '' },
      { json: 'N8EN11A', js: 'N8EN11A', typ: '' },
      { json: 'N8EN11B', js: 'N8EN11B', typ: '' },
      { json: 'N8EN11C', js: 'N8EN11C', typ: '' },
      { json: 'N8EN12', js: 'N8EN12', typ: '' },
      { json: 'N8EN12A', js: 'N8EN12A', typ: '' },
      { json: 'N8EN12B', js: 'N8EN12B', typ: '' },
    ],
    false,
  ),
  FISELogiciel: o(
    [
      { json: 'N7EN09', js: 'N7EN09', typ: '' },
      { json: 'N7EN09A', js: 'N7EN09A', typ: '' },
      { json: 'N7EN09B', js: 'N7EN09B', typ: '' },
      { json: 'N7EN09C', js: 'N7EN09C', typ: '' },
      { json: 'N7EN10', js: 'N7EN10', typ: '' },
      { json: 'N7EN10A', js: 'N7EN10A', typ: '' },
      { json: 'N7EN10B', js: 'N7EN10B', typ: '' },
      { json: 'N7EN11', js: 'N7EN11', typ: '' },
      { json: 'N7EN11A', js: 'N7EN11A', typ: '' },
      { json: 'N7EN12', js: 'N7EN12', typ: '' },
      { json: 'N7EN12A', js: 'N7EN12A', typ: '' },
      { json: 'N7EN12B', js: 'N7EN12B', typ: '' },
      { json: 'N7EN13', js: 'N7EN13', typ: '' },
      { json: 'N7EN13A', js: 'N7EN13A', typ: '' },
      { json: 'N8EN01', js: 'N8EN01', typ: '' },
      { json: 'N8EN01A', js: 'N8EN01A', typ: '' },
      { json: 'N8EN01B', js: 'N8EN01B', typ: '' },
      { json: 'N8EN01C', js: 'N8EN01C', typ: '' },
      { json: 'N8EN01E', js: 'N8EN01E', typ: '' },
      { json: 'N8EN08', js: 'N8EN08', typ: '' },
      { json: 'N8EN08A', js: 'N8EN08A', typ: '' },
      { json: 'N8EN08B', js: 'N8EN08B', typ: '' },
      { json: 'N8EN09', js: 'N8EN09', typ: '' },
      { json: 'N8EN09A', js: 'N8EN09A', typ: '' },
      { json: 'N8EN09B', js: 'N8EN09B', typ: '' },
      { json: 'N8EN09C', js: 'N8EN09C', typ: '' },
      { json: 'N8EN10', js: 'N8EN10', typ: '' },
      { json: 'N8EN10A', js: 'N8EN10A', typ: '' },
      { json: 'N8EN12', js: 'N8EN12', typ: '' },
      { json: 'N8EN12A', js: 'N8EN12A', typ: '' },
      { json: 'N8EN12B', js: 'N8EN12B', typ: '' },
    ],
    false,
  ),
  Réseau: o(
    [
      { json: 'N7EN02', js: 'N7EN02', typ: '' },
      { json: 'N7EN02A', js: 'N7EN02A', typ: '' },
      { json: 'N7EN02B', js: 'N7EN02B', typ: '' },
      { json: 'N7EN02C', js: 'N7EN02C', typ: '' },
      { json: 'N7EN03', js: 'N7EN03', typ: '' },
      { json: 'N7EN03A', js: 'N7EN03A', typ: '' },
      { json: 'N7EN03B', js: 'N7EN03B', typ: '' },
      { json: 'N7EN03C', js: 'N7EN03C', typ: '' },
      { json: 'N7EN03D', js: 'N7EN03D', typ: '' },
      { json: 'N7EN05', js: 'N7EN05', typ: '' },
      { json: 'N7EN05A', js: 'N7EN05A', typ: '' },
      { json: 'N7EN05B', js: 'N7EN05B', typ: '' },
      { json: 'N7EN05C', js: 'N7EN05C', typ: '' },
      { json: 'N7EN06', js: 'N7EN06', typ: '' },
      { json: 'N7EN06A', js: 'N7EN06A', typ: '' },
      { json: 'N7EN06B', js: 'N7EN06B', typ: '' },
      { json: 'N7EN09', js: 'N7EN09', typ: '' },
      { json: 'N7EN09A', js: 'N7EN09A', typ: '' },
      { json: 'N7EN09B', js: 'N7EN09B', typ: '' },
      { json: 'N7EN09C', js: 'N7EN09C', typ: '' },
      { json: 'N8EN18', js: 'N8EN18', typ: '' },
      { json: 'N8EN18A', js: 'N8EN18A', typ: '' },
      { json: 'N8EN18B', js: 'N8EN18B', typ: '' },
      { json: 'N8EN18C', js: 'N8EN18C', typ: '' },
      { json: 'N8EN18D', js: 'N8EN18D', typ: '' },
      { json: 'N8EN20', js: 'N8EN20', typ: '' },
      { json: 'N8EN20B', js: 'N8EN20B', typ: '' },
      { json: 'N8EN20C', js: 'N8EN20C', typ: '' },
      { json: 'N8EN22', js: 'N8EN22', typ: '' },
      { json: 'N8EN22A', js: 'N8EN22A', typ: '' },
      { json: 'N8EN22B', js: 'N8EN22B', typ: '' },
      { json: 'N8EN23', js: 'N8EN23', typ: '' },
      { json: 'N8EN23A', js: 'N8EN23A', typ: '' },
      { json: 'N8EN23B', js: 'N8EN23B', typ: '' },
      { json: 'N8EN23C', js: 'N8EN23C', typ: '' },
      { json: 'N8EN24', js: 'N8EN24', typ: '' },
      { json: 'N8EN24A', js: 'N8EN24A', typ: '' },
      { json: 'N8EN24B', js: 'N8EN24B', typ: '' },
      { json: 'N8EN24C', js: 'N8EN24C', typ: '' },
      { json: 'N8EN24D', js: 'N8EN24D', typ: '' },
      { json: 'N8EN24E', js: 'N8EN24E', typ: '' },
    ],
    false,
  ),
  Télécom: o(
    [
      { json: 'N7EN01', js: 'N7EN01', typ: '' },
      { json: 'N7EN01A', js: 'N7EN01A', typ: '' },
      { json: 'N7EN01B', js: 'N7EN01B', typ: '' },
      { json: 'N7EN01C', js: 'N7EN01C', typ: '' },
      { json: 'N7EN02', js: 'N7EN02', typ: '' },
      { json: 'N7EN02A', js: 'N7EN02A', typ: '' },
      { json: 'N7EN02B', js: 'N7EN02B', typ: '' },
      { json: 'N7EN02C', js: 'N7EN02C', typ: '' },
      { json: 'N7EN03', js: 'N7EN03', typ: '' },
      { json: 'N7EN03A', js: 'N7EN03A', typ: '' },
      { json: 'N7EN03B', js: 'N7EN03B', typ: '' },
      { json: 'N7EN03C', js: 'N7EN03C', typ: '' },
      { json: 'N7EN03D', js: 'N7EN03D', typ: '' },
      { json: 'N7EN05', js: 'N7EN05', typ: '' },
      { json: 'N7EN05A', js: 'N7EN05A', typ: '' },
      { json: 'N7EN05B', js: 'N7EN05B', typ: '' },
      { json: 'N7EN05C', js: 'N7EN05C', typ: '' },
      { json: 'N7EN06', js: 'N7EN06', typ: '' },
      { json: 'N7EN06A', js: 'N7EN06A', typ: '' },
      { json: 'N7EN06B', js: 'N7EN06B', typ: '' },
      { json: 'N8EN13', js: 'N8EN13', typ: '' },
      { json: 'N8EN13A', js: 'N8EN13A', typ: '' },
      { json: 'N8EN13B', js: 'N8EN13B', typ: '' },
      { json: 'N8EN13C', js: 'N8EN13C', typ: '' },
      { json: 'N8EN13D', js: 'N8EN13D', typ: '' },
      { json: 'N8EN14', js: 'N8EN14', typ: '' },
      { json: 'N8EN14A', js: 'N8EN14A', typ: '' },
      { json: 'N8EN14B', js: 'N8EN14B', typ: '' },
      { json: 'N8EN14C', js: 'N8EN14C', typ: '' },
      { json: 'N8EN14D', js: 'N8EN14D', typ: '' },
      { json: 'N8EN16', js: 'N8EN16', typ: '' },
      { json: 'N8EN16A', js: 'N8EN16A', typ: '' },
      { json: 'N8EN16C', js: 'N8EN16C', typ: '' },
      { json: 'N8EN19', js: 'N8EN19', typ: '' },
      { json: 'N8EN19A', js: 'N8EN19A', typ: '' },
      { json: 'N8EN19B', js: 'N8EN19B', typ: '' },
      { json: 'N8EN19C', js: 'N8EN19C', typ: '' },
      { json: 'N8EN20', js: 'N8EN20', typ: '' },
      { json: 'N8EN20A', js: 'N8EN20A', typ: '' },
      { json: 'N8EN20B', js: 'N8EN20B', typ: '' },
      { json: 'N8EN20C', js: 'N8EN20C', typ: '' },
    ],
    false,
  ),
  Sn3A: o([{ json: '(*)', js: '(*)', typ: r('Magenta') }], false),
  Magenta: o(
    [
      { json: 'HPC et Big Data', js: 'HPC et Big Data', typ: r('HPCEtBigData') },
      { json: 'IBDIOT', js: 'IBDIOT', typ: r('Ibdiot') },
      { json: 'IMM', js: 'IMM', typ: r('Imm') },
      { json: 'SEmbiIOT', js: 'SEmbiIOT', typ: r('SEmbiIOT') },
      { json: 'Logiciel', js: 'Logiciel', typ: r('Logiciel') },
      {
        json: 'Télécom et objets connectés',
        js: 'Télécom et objets connectés',
        typ: r('TélécomEtObjetsConnectés'),
      },
      { json: 'ModIA', js: 'ModIA', typ: a(u(r('ModIAModIA'), '')) },
    ],
    false,
  ),
  HPCEtBigData: o(
    [
      { json: 'N9EN11', js: 'N9EN11', typ: '' },
      { json: 'N9EN11A', js: 'N9EN11A', typ: '' },
      { json: 'N9EN11B', js: 'N9EN11B', typ: '' },
      { json: 'N9EN11C', js: 'N9EN11C', typ: '' },
      { json: 'N9EN19', js: 'N9EN19', typ: '' },
      { json: 'N9EN20', js: 'N9EN20', typ: '' },
      { json: 'N9EN20A', js: 'N9EN20A', typ: '' },
      { json: 'N9EN20B', js: 'N9EN20B', typ: '' },
      { json: 'N9EN20C', js: 'N9EN20C', typ: '' },
      { json: 'N9EN20E', js: 'N9EN20E', typ: '' },
      { json: 'N9EN21', js: 'N9EN21', typ: '' },
      { json: 'N9EN21A', js: 'N9EN21A', typ: '' },
    ],
    false,
  ),
  Ibdiot: o(
    [
      { json: 'N9EN01', js: 'N9EN01', typ: '' },
      { json: 'N9EN01B', js: 'N9EN01B', typ: '' },
      { json: 'N9EN01C', js: 'N9EN01C', typ: '' },
      { json: 'N9EN01D', js: 'N9EN01D', typ: '' },
      { json: 'N9EN08', js: 'N9EN08', typ: '' },
      { json: 'N9EN08A', js: 'N9EN08A', typ: '' },
      { json: 'N9EN08B', js: 'N9EN08B', typ: '' },
      { json: 'N9EN09', js: 'N9EN09', typ: '' },
      { json: 'N8EN09B', js: 'N8EN09B', typ: '' },
      { json: 'N9EN09C', js: 'N9EN09C', typ: '' },
      { json: 'N9EN09D', js: 'N9EN09D', typ: '' },
      { json: 'N9EN09E', js: 'N9EN09E', typ: '' },
      { json: 'N9EN09F', js: 'N9EN09F', typ: '' },
      { json: 'N9EN10', js: 'N9EN10', typ: '' },
      { json: 'N9EN10A', js: 'N9EN10A', typ: '' },
      { json: 'N9EN10B', js: 'N9EN10B', typ: '' },
      { json: 'N9EN10C', js: 'N9EN10C', typ: '' },
    ],
    false,
  ),
  Imm: o(
    [
      { json: 'N9EN15', js: 'N9EN15', typ: '' },
      { json: 'N9EN15A', js: 'N9EN15A', typ: '' },
      { json: 'N9EN16', js: 'N9EN16', typ: '' },
      { json: 'N9EN16A', js: 'N9EN16A', typ: '' },
      { json: 'N9EN16B', js: 'N9EN16B', typ: '' },
      { json: 'N9EN16C', js: 'N9EN16C', typ: '' },
      { json: 'N9EN17', js: 'N9EN17', typ: '' },
      { json: 'N9EN17A', js: 'N9EN17A', typ: '' },
      { json: 'N9EN17B', js: 'N9EN17B', typ: '' },
      { json: 'N9EN17C', js: 'N9EN17C', typ: '' },
      { json: 'N9EN18', js: 'N9EN18', typ: '' },
      { json: 'N9EN18A', js: 'N9EN18A', typ: '' },
    ],
    false,
  ),
  Logiciel: o(
    [
      { json: 'N9EN05', js: 'N9EN05', typ: '' },
      { json: 'N9EN05A', js: 'N9EN05A', typ: '' },
      { json: 'N9EN05B', js: 'N9EN05B', typ: '' },
      { json: 'N9EN05C', js: 'N9EN05C', typ: '' },
      { json: 'N9EN11', js: 'N9EN11', typ: '' },
      { json: 'N9EN11A', js: 'N9EN11A', typ: '' },
      { json: 'N9EN 11B', js: 'N9EN 11B', typ: '' },
      { json: 'N9EN11C', js: 'N9EN11C', typ: '' },
      { json: 'N9EN12', js: 'N9EN12', typ: '' },
      { json: 'N9EN12A', js: 'N9EN12A', typ: '' },
      { json: 'N9EN12B', js: 'N9EN12B', typ: '' },
      { json: 'N9EN13', js: 'N9EN13', typ: '' },
      { json: 'N9EN13A', js: 'N9EN13A', typ: '' },
      { json: 'N9EN13B', js: 'N9EN13B', typ: '' },
      { json: 'N9EN13C', js: 'N9EN13C', typ: '' },
      { json: 'N9EN13D', js: 'N9EN13D', typ: '' },
    ],
    false,
  ),
  ModIAModIA: o(
    [
      { json: 'N0EAN01', js: 'N0EAN01', typ: u(undefined, '') },
      { json: 'N0EAN02', js: 'N0EAN02', typ: u(undefined, '') },
      { json: 'N0EAN03', js: 'N0EAN03', typ: u(undefined, '') },
      { json: 'N0EAN04', js: 'N0EAN04', typ: u(undefined, '') },
      { json: 'N0EAN05', js: 'N0EAN05', typ: u(undefined, '') },
    ],
    false,
  ),
  SEmbiIOT: o(
    [
      { json: 'N9EN05', js: 'N9EN05', typ: '' },
      { json: 'N9EN05A', js: 'N9EN05A', typ: '' },
      { json: 'N9EN05B', js: 'N9EN05B', typ: '' },
      { json: 'N9EN05C', js: 'N9EN05C', typ: '' },
      { json: 'N9EN06', js: 'N9EN06', typ: '' },
      { json: 'N9EN06A', js: 'N9EN06A', typ: '' },
      { json: 'N9EN06B', js: 'N9EN06B', typ: '' },
      { json: 'N9EN06C', js: 'N9EN06C', typ: '' },
      { json: 'N9EN07', js: 'N9EN07', typ: '' },
      { json: 'N9EN07A', js: 'N9EN07A', typ: '' },
      { json: 'N9EN07B', js: 'N9EN07B', typ: '' },
      { json: 'N9EN07C', js: 'N9EN07C', typ: '' },
      { json: 'N9EN07D', js: 'N9EN07D', typ: '' },
      { json: 'N9EN23', js: 'N9EN23', typ: '' },
      { json: 'N9EN23A', js: 'N9EN23A', typ: '' },
      { json: 'N9EN23B', js: 'N9EN23B', typ: '' },
      { json: 'N9EN23C', js: 'N9EN23C', typ: '' },
      { json: 'N9EN23D', js: 'N9EN23D', typ: '' },
    ],
    false,
  ),
  TélécomEtObjetsConnectés: o(
    [
      { json: 'N9EN02', js: 'N9EN02', typ: '' },
      { json: 'N9EN02A', js: 'N9EN02A', typ: '' },
      { json: 'N9EN02B', js: 'N9EN02B', typ: '' },
      { json: 'N9EN02C', js: 'N9EN02C', typ: '' },
      { json: 'N9EN03', js: 'N9EN03', typ: '' },
      { json: 'N9EN03B', js: 'N9EN03B', typ: '' },
      { json: 'N9EN03C', js: 'N9EN03C', typ: '' },
      { json: 'N9EN03D', js: 'N9EN03D', typ: '' },
      { json: 'N9EN04', js: 'N9EN04', typ: '' },
      { json: 'N9EN04A', js: 'N9EN04A', typ: '' },
      { json: 'N9EN04B', js: 'N9EN04B', typ: '' },
      { json: 'N9EN14', js: 'N9EN14', typ: '' },
      { json: 'N9EN14A', js: 'N9EN14A', typ: '' },
      { json: 'N9EN14B', js: 'N9EN14B', typ: '' },
      { json: 'N9EN14C', js: 'N9EN14C', typ: '' },
    ],
    false,
  ),
};
