import { getModule, indexModule } from '$lib/server/modules';
import { loadSchema } from '$lib/server/schema-loader';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	try {
		const module = params.module === 'index' ? await indexModule() : await getModule(params.module);
		return {
			schema: await loadSchema(),
			module
		};
	} catch (err) {
		error(404, { message: `Module ${params.module} inexistant` });
	}
}
