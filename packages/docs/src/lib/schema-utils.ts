import type { SchemaClass } from './schema';

export function findQueryInSchema(schema: SchemaClass, name: string) {
	const field = schema.types
		.find((type) => type.name === schema.queryType.name)
		?.fields?.find((field) => field.name === name);

	// if (!field) throw new Error(`Query ${name} not found in schema.`);

	return field;
}

export function findMutationInSchema(schema: SchemaClass, name: string) {
	const field = schema.types
		.find((type) => type.name === (schema.mutationType ?? { name: '' }).name)
		?.fields?.find((field) => field.name === name);

	// if (!field) throw new Error(`Mutation ${name} not found in schema.`);

	return field;
}

export function findSubscriptionInSchema(schema: SchemaClass, name: string) {
	const field = schema.types
		.find((type) => type.name === (schema.subscriptionType ?? { name: '' }).name)
		?.fields?.find((field) => field.name === name);

	// if (!field) throw new Error(`Subscription ${name} not found in schema.`);

	return field;
}

export function findTypeInSchema(schema: SchemaClass, name: string) {
	const type = schema.types.find((type) => type.name === name);

	// if (!type) throw new Error(`Type ${name} not found in schema.`);

	return type;
}
