<script lang="ts">
  import { goto, pushState } from '$app/navigation';
  import { DeletePageStore, fragment, graphql, type ModalDeleteCustomPage } from '$houdini';
  import ModalConfirmDelete from '$lib/components/ModalConfirmDelete.svelte';
  import { loaded, type MaybeLoading } from '$lib/loading';
  import { toasts } from '$lib/toasts';

  export let customPage: ModalDeleteCustomPage | null;
  $: data = fragment(
    customPage,
    graphql(`
      fragment ModalDeleteCustomPage on Page @loading {
        id
        path
        studentAssociation {
          uid
        }
        group {
          uid
        }
      }
    `),
  );

  $: isLinkedToGroup = Boolean($data?.group);
  $: resourceUid = ((isLinkedToGroup ? $data?.group!.uid : $data?.studentAssociation!.uid) ??
    '') as MaybeLoading<string>;

  export const openDeletionConfirmation = () => {
    pushState('', {
      NAVTOP_DELETING: true,
    });
  };
</script>

{#if $data && loaded($data.id) && loaded($data.path)}
  <ModalConfirmDelete
    on:confirm={async () => {
      if (!loaded($data.id) || !loaded(resourceUid)) return;
      const result = await new DeletePageStore().mutate({ id: $data.id });
      toasts.mutation(
        result,
        'deletePage',
        ({ title }) => `Page “${title}” supprimée`,
        'Erreur lors de la suppression',
      );
      await goto(
        `/${isLinkedToGroup ? 'groups' : 'student-associations'}/${resourceUid}/edit/pages`,
      );
    }}
    typeToConfirm={$data.path}
  ></ModalConfirmDelete>
{/if}
