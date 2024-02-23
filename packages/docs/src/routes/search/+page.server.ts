import { findMutationInSchema, findQueryInSchema, findTypeInSchema } from '$lib/schema-utils.js';
import { getAllModules } from '$lib/server/modules';
import { loadSchema } from '$lib/server/schema-loader';

export async function load() {
	const schema = await loadSchema();
	const modules = await getAllModules();

	const queries = modules.flatMap((module) =>
		module.queries
			.map((q) => findQueryInSchema(schema, q)!)
			.filter(Boolean)
			.map((q) => ({ ...q, module }))
	);
	const mutations = modules.flatMap((module) =>
		module.mutations
			.map((m) => findMutationInSchema(schema, m)!)
			.filter(Boolean)
			.map((m) => ({ ...m, module }))
	);

	const types = modules.flatMap((module) =>
		module.types
			.map((t) => findTypeInSchema(schema, t)!)
			.filter(Boolean)
			.map((t) => ({
				...t,
				args: t.fields,
				isType: true,
				module
			}))
	);

	return {
		queries,
		types,
		mutations,
		modules
	};
}
