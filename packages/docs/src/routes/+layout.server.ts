import { getAllResolvers } from '$lib/server/modules';
import { loadSchema } from '$lib/server/schema-loader';

export const prerender = true;

export const trailingSlash = 'always';

export async function load() {
	const schema = await loadSchema();

	return {
		successTypes: Object.fromEntries(
			schema.types
				.filter((type) => type.kind === 'OBJECT' && type.name.endsWith('Success'))
				.map((t) => [t.name, t.fields?.find((f) => f.name === 'data')?.type])
		),
		edgeTypes: Object.fromEntries(
			schema.types
				.filter((type) => type.kind === 'OBJECT' && type.name.endsWith('ConnectionEdge'))
				.map((t) => [t.name, t.fields?.find((f) => f.name === 'node')?.type])
		),
		enumTypes: Object.fromEntries(
			schema.types.filter((type) => type.kind === 'ENUM').map((t) => [t.name, t.enumValues])
		),
		types: Object.fromEntries(schema.types.map((t) => [t.name, t])),
		allResolvers: await getAllResolvers()
	};
}
