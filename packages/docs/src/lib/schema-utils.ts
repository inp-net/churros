import type { Schema } from './schema';

export function findQueryInSchema(schema: Schema, name: string) {
	const field = schema.types
		.find((type) => type.name === schema.queryType.name)
		?.fields?.find((field) => field.name === name);

	// if (!field) throw new Error(`Query ${name} not found in schema.`);

	return field;
}

export function findMutationInSchema(schema: Schema, name: string) {
    const field = schema.types
        .find((type) => type.name === schema.mutationType.name)
        ?.fields?.find((field) => field.name === name);

    // if (!field) throw new Error(`Mutation ${name} not found in schema.`);

    return field;
}

export function findSubscriptionInSchema(schema: Schema, name: string) {
    const field = schema.types
        .find((type) => type.name === schema.subscriptionType.name)
        ?.fields?.find((field) => field.name === name);

    // if (!field) throw new Error(`Subscription ${name} not found in schema.`);

    return field;
}


export function findTypeInSchema(schema: Schema, name: string) {
    const type = schema.types.find((type) => type.name === name);

    // if (!type) throw new Error(`Type ${name} not found in schema.`);

    return type;
}
