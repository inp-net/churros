<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql } from '$houdini';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import ModalConfirmDelete from '$lib/components/ModalConfirmDelete.svelte';
  import { updateTitle } from '$lib/components/NavigationTop.svelte';
  import { loaded } from '$lib/loading';
  import { mutateAndToast } from '$lib/mutations';
  import { route } from '$lib/ROUTES';
  import FormAnnouncement from '../../FormAnnouncement.svelte';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageAnnouncementEdit } = data);
  const Delete = graphql(`
    mutation DeleteAnnouncement($id: LocalID!) {
      deleteAnnouncement(id: $id) {
        ...MutationErrors
        ... on MutationDeleteAnnouncementSuccess {
          data {
            id
          }
        }
      }
    }
  `);

  $: if (
    $PageAnnouncementEdit.data?.announcement &&
    loaded($PageAnnouncementEdit.data.announcement.title)
  )
    updateTitle(`Annonce “${$PageAnnouncementEdit.data.announcement.title}”`);
</script>

<ModalConfirmDelete
  title="Supprimer l'annonce"
  on:confirm={async () => {
    const ok = await mutateAndToast(Delete, {
      id: $page.params.id,
    });
    if (ok) await goto(route('/announcements'));
  }}
/>

<MaybeError result={$PageAnnouncementEdit} let:data={{ announcement }}>
  <FormAnnouncement {announcement} on:saved={() => goto(route('/announcements'))} />
</MaybeError>
