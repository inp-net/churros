import { load_PageGroupCustomPage } from '$houdini';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';

export async function load(event) {
  const result = await load_PageGroupCustomPage({ event, variables: event.params });
  const { data } = get(result.PageGroupCustomPage);
  if (!data?.group.page) error(404);
  return result;
}
