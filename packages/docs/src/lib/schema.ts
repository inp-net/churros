/* eslint-disable */
// To parse this data:
//
//   import { Convert, Schema } from "./file";
//
//   const schema = Convert.toSchema(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Schema {
	data: Data;
}

export interface Data {
	__schema: SchemaClass;
}

export interface SchemaClass {
	queryType: Type;
	mutationType: Type;
	subscriptionType: Type;
	types: SchemaType[];
	directives: Directive[];
}

export interface Directive {
	name: string;
	description: string;
	locations: string[];
	args: Arg[];
}

export interface Arg {
	name: string;
	description: null | string;
	type: InterfaceElement;
	defaultValue: null | string;
}

export interface InterfaceElement {
	kind: Kind;
	name: null | string;
	ofType: InterfaceElement | null;
}

export enum Kind {
	Enum = 'ENUM',
	InputObject = 'INPUT_OBJECT',
	Interface = 'INTERFACE',
	List = 'LIST',
	NonNull = 'NON_NULL',
	Object = 'OBJECT',
	Scalar = 'SCALAR',
	Union = 'UNION'
}

export interface Type {
	name: string;
}

export interface SchemaType {
	kind: Kind;
	name: string;
	description: null | string;
	fields: Field[] | null;
	inputFields: Arg[] | null;
	interfaces: InterfaceElement[] | null;
	enumValues: EnumValue[] | null;
	possibleTypes: InterfaceElement[] | null;
}

export interface EnumValue {
	name: string;
	description: null | string;
	isDeprecated: boolean;
	deprecationReason: null;
}

export interface Field {
	name: string;
	description: null | string;
	args: Arg[];
	type: InterfaceElement;
	isDeprecated: boolean;
	deprecationReason: null;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
	public static toSchema(json: string): Schema {
		// return cast(JSON.parse(json), r("Schema"));
		return JSON.parse(json);
	}

	public static schemaToJson(value: Schema): string {
		return JSON.stringify(uncast(value, r('Schema')), null, 2);
	}
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
	const prettyTyp = prettyTypeName(typ);
	const parentText = parent ? ` on ${parent}` : '';
	const keyText = key ? ` for key "${key}"` : '';
	throw Error(
		`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`
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
			parent
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
	Schema: o([{ json: 'data', js: 'data', typ: r('Data') }], false),
	Data: o([{ json: '__schema', js: '__schema', typ: r('SchemaClass') }], false),
	SchemaClass: o(
		[
			{ json: 'queryType', js: 'queryType', typ: r('Type') },
			{ json: 'mutationType', js: 'mutationType', typ: r('Type') },
			{ json: 'subscriptionType', js: 'subscriptionType', typ: r('Type') },
			{ json: 'types', js: 'types', typ: a(r('SchemaType')) },
			{ json: 'directives', js: 'directives', typ: a(r('Directive')) }
		],
		false
	),
	Directive: o(
		[
			{ json: 'name', js: 'name', typ: '' },
			{ json: 'description', js: 'description', typ: '' },
			{ json: 'locations', js: 'locations', typ: a('') },
			{ json: 'args', js: 'args', typ: a(r('Arg')) }
		],
		false
	),
	Arg: o(
		[
			{ json: 'name', js: 'name', typ: '' },
			{ json: 'description', js: 'description', typ: u(null, '') },
			{ json: 'type', js: 'type', typ: r('InterfaceElement') },
			{ json: 'defaultValue', js: 'defaultValue', typ: u(null, '') }
		],
		false
	),
	InterfaceElement: o(
		[
			{ json: 'kind', js: 'kind', typ: r('Kind') },
			{ json: 'name', js: 'name', typ: u(null, '') },
			{ json: 'ofType', js: 'ofType', typ: u(r('InterfaceElement'), null) }
		],
		false
	),
	Type: o([{ json: 'name', js: 'name', typ: '' }], false),
	SchemaType: o(
		[
			{ json: 'kind', js: 'kind', typ: r('Kind') },
			{ json: 'name', js: 'name', typ: '' },
			{ json: 'description', js: 'description', typ: u(null, '') },
			{ json: 'fields', js: 'fields', typ: u(a(r('Field')), null) },
			{ json: 'inputFields', js: 'inputFields', typ: u(a(r('Arg')), null) },
			{ json: 'interfaces', js: 'interfaces', typ: u(a(r('InterfaceElement')), null) },
			{ json: 'enumValues', js: 'enumValues', typ: u(a(r('EnumValue')), null) },
			{ json: 'possibleTypes', js: 'possibleTypes', typ: u(a(r('InterfaceElement')), null) }
		],
		false
	),
	EnumValue: o(
		[
			{ json: 'name', js: 'name', typ: '' },
			{ json: 'description', js: 'description', typ: u(null, '') },
			{ json: 'isDeprecated', js: 'isDeprecated', typ: true },
			{ json: 'deprecationReason', js: 'deprecationReason', typ: null }
		],
		false
	),
	Field: o(
		[
			{ json: 'name', js: 'name', typ: '' },
			{ json: 'description', js: 'description', typ: u(null, '') },
			{ json: 'args', js: 'args', typ: a(r('Arg')) },
			{ json: 'type', js: 'type', typ: r('InterfaceElement') },
			{ json: 'isDeprecated', js: 'isDeprecated', typ: true },
			{ json: 'deprecationReason', js: 'deprecationReason', typ: null }
		],
		false
	),
	Kind: ['ENUM', 'INPUT_OBJECT', 'INTERFACE', 'LIST', 'NON_NULL', 'OBJECT', 'SCALAR', 'UNION']
};
