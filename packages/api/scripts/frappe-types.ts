// To parse this data:
//
//   import { Convert, FrappeTypes } from "./file";
//
//   const frappeTypes = Convert.toFrappeTypes(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface FrappeTypes {
  auth_user: AuthUser[];
  frappe_annee: Frappe[];
  frappe_commentaire: FrappeCommentaire[];
  frappe_document: FrappeDocument[];
  frappe_documentfichier: FrappeDocumentfichier[];
  frappe_document_tags: FrappeDocumentTag[];
  frappe_filiere: FrappeFiliere[];
  frappe_matiere: FrappeMatiere[];
  frappe_tag: Frappe[];
  portailuser_portailuser: PortailuserPortailuser[];
}

export interface AuthUser {
  id: string;
  password: string;
  last_login: Date | null;
  is_superuser: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_staff: string;
  is_active: string;
  date_joined: Date;
}

export interface Frappe {
  id: string;
  nom: string;
  ecole_id: string;
  color?: string;
}

export interface FrappeCommentaire {
  id: string;
  derniere_modif: Date;
  creation: Date;
  message: string;
  auteur_id: string;
  document_id: string;
}

export interface FrappeDocument {
  id: string;
  nom: string;
  annee: null | string;
  description: null | string;
  derniere_modif: Date;
  creation: Date;
  auteur_id: string;
  matiere_id: string;
}

export interface FrappeDocumentTag {
  id: string;
  document_id: string;
  tag_id: string;
}

export interface FrappeDocumentfichier {
  id: string;
  fichier: string;
  ordre: string;
  document_id: string;
}

export interface FrappeFiliere {
  id: string;
  nom: string;
  annee_id: string;
}

export interface FrappeMatiere {
  id: string;
  nom: string;
  filiere_id: string;
}

export interface PortailuserPortailuser {
  user_ptr_id: string;
  edt_club_events: null | string;
  ecole_id: string;
  force_change_passwd: string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toFrappeTypes(json: string): FrappeTypes {
    return cast(JSON.parse(json), r('FrappeTypes'));
  }

  public static frappeTypesToJson(value: FrappeTypes): string {
    return JSON.stringify(uncast(value, r('FrappeTypes')), null, 2);
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

function r(name: string) {
  return { ref: name };
}

const typeMap: any = {
  FrappeTypes: o(
    [
      { json: 'auth_user', js: 'auth_user', typ: a(r('AuthUser')) },
      { json: 'frappe_annee', js: 'frappe_annee', typ: a(r('Frappe')) },
      { json: 'frappe_commentaire', js: 'frappe_commentaire', typ: a(r('FrappeCommentaire')) },
      { json: 'frappe_document', js: 'frappe_document', typ: a(r('FrappeDocument')) },
      {
        json: 'frappe_documentfichier',
        js: 'frappe_documentfichier',
        typ: a(r('FrappeDocumentfichier')),
      },
      { json: 'frappe_document_tags', js: 'frappe_document_tags', typ: a(r('FrappeDocumentTag')) },
      { json: 'frappe_filiere', js: 'frappe_filiere', typ: a(r('FrappeFiliere')) },
      { json: 'frappe_matiere', js: 'frappe_matiere', typ: a(r('FrappeMatiere')) },
      { json: 'frappe_tag', js: 'frappe_tag', typ: a(r('Frappe')) },
      {
        json: 'portailuser_portailuser',
        js: 'portailuser_portailuser',
        typ: a(r('PortailuserPortailuser')),
      },
    ],
    false,
  ),
  AuthUser: o(
    [
      { json: 'id', js: 'id', typ: '' },
      { json: 'password', js: 'password', typ: '' },
      { json: 'last_login', js: 'last_login', typ: u(Date, null) },
      { json: 'is_superuser', js: 'is_superuser', typ: '' },
      { json: 'username', js: 'username', typ: '' },
      { json: 'first_name', js: 'first_name', typ: '' },
      { json: 'last_name', js: 'last_name', typ: '' },
      { json: 'email', js: 'email', typ: '' },
      { json: 'is_staff', js: 'is_staff', typ: '' },
      { json: 'is_active', js: 'is_active', typ: '' },
      { json: 'date_joined', js: 'date_joined', typ: Date },
    ],
    false,
  ),
  Frappe: o(
    [
      { json: 'id', js: 'id', typ: '' },
      { json: 'nom', js: 'nom', typ: '' },
      { json: 'ecole_id', js: 'ecole_id', typ: '' },
      { json: 'color', js: 'color', typ: u(undefined, '') },
    ],
    false,
  ),
  FrappeCommentaire: o(
    [
      { json: 'id', js: 'id', typ: '' },
      { json: 'derniere_modif', js: 'derniere_modif', typ: Date },
      { json: 'creation', js: 'creation', typ: Date },
      { json: 'message', js: 'message', typ: '' },
      { json: 'auteur_id', js: 'auteur_id', typ: '' },
      { json: 'document_id', js: 'document_id', typ: '' },
    ],
    false,
  ),
  FrappeDocument: o(
    [
      { json: 'id', js: 'id', typ: '' },
      { json: 'nom', js: 'nom', typ: '' },
      { json: 'annee', js: 'annee', typ: u(null, '') },
      { json: 'description', js: 'description', typ: u(null, '') },
      { json: 'derniere_modif', js: 'derniere_modif', typ: Date },
      { json: 'creation', js: 'creation', typ: Date },
      { json: 'auteur_id', js: 'auteur_id', typ: '' },
      { json: 'matiere_id', js: 'matiere_id', typ: '' },
    ],
    false,
  ),
  FrappeDocumentTag: o(
    [
      { json: 'id', js: 'id', typ: '' },
      { json: 'document_id', js: 'document_id', typ: '' },
      { json: 'tag_id', js: 'tag_id', typ: '' },
    ],
    false,
  ),
  FrappeDocumentfichier: o(
    [
      { json: 'id', js: 'id', typ: '' },
      { json: 'fichier', js: 'fichier', typ: '' },
      { json: 'ordre', js: 'ordre', typ: '' },
      { json: 'document_id', js: 'document_id', typ: '' },
    ],
    false,
  ),
  FrappeFiliere: o(
    [
      { json: 'id', js: 'id', typ: '' },
      { json: 'nom', js: 'nom', typ: '' },
      { json: 'annee_id', js: 'annee_id', typ: '' },
    ],
    false,
  ),
  FrappeMatiere: o(
    [
      { json: 'id', js: 'id', typ: '' },
      { json: 'nom', js: 'nom', typ: '' },
      { json: 'filiere_id', js: 'filiere_id', typ: '' },
    ],
    false,
  ),
  PortailuserPortailuser: o(
    [
      { json: 'user_ptr_id', js: 'user_ptr_id', typ: '' },
      { json: 'edt_club_events', js: 'edt_club_events', typ: u(null, '') },
      { json: 'ecole_id', js: 'ecole_id', typ: '' },
      { json: 'force_change_passwd', js: 'force_change_passwd', typ: '' },
    ],
    false,
  ),
};
