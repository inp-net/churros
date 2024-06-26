import { load_PageGroupCustomPageEdit } from '$houdini';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';

export async function load(event) {
  const result = await load_PageGroupCustomPageEdit({ event, variables: event.params });
  const { data } = get(result.PageGroupCustomPageEdit);
  if (!data?.group.page) error(404);
  if (!data.group.page.canBeEdited) error(403);
  return result;
}
