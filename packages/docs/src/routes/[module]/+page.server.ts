import { Convert } from '$lib/schema';
import { getModule } from '$lib/server/modules';
import { readFile } from 'node:fs/promises';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	try {
		const module = await getModule(params.module);
		return {
			schema: Convert.toSchema(await readFile('src/lib/server/schema.json', 'utf-8')),
			module
		};
	} catch (err) {
		error(404, { message: `Module ${params.module} inexistant` });
	}
}
