import { load_PageStudentAssociationCustomPageEdit } from '$houdini';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';

export async function load(event) {
  const result = await load_PageStudentAssociationCustomPageEdit({
    event,
    variables: event.params,
  });
  const { data } = get(result.PageStudentAssociationCustomPageEdit);
  if (!data?.studentAssociation.page) error(404);
  if (!data.studentAssociation.page.canBeEdited) error(403);
  return result;
}
