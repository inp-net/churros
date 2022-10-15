import { loadQuery } from '$lib/zeus.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) =>
  loadQuery({ article: [params, { title: true }] }, { fetch, parent });
