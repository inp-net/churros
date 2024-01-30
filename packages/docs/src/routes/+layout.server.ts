import { Convert } from '$lib/schema';
import { getAllResolvers, getModule } from '$lib/server/modules';
import { readFile, readdir } from 'node:fs/promises';

export const prerender = true;

export async function load() {
	const schema = Convert.toSchema(await readFile('src/lib/server/schema.json', 'utf-8'));

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
