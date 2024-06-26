import { load_PageStudentAssociationCustomPage } from '$houdini';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';

export const ssr = true;

export async function load(event) {
  const result = await load_PageStudentAssociationCustomPage({ event, variables: event.params });
  const { data } = get(result.PageStudentAssociationCustomPage);
  if (!data?.studentAssociation.page) error(404);
  return result;
}
