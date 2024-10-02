<script lang="ts">
  import { goto } from '$app/navigation';
  import { graphql } from '$houdini';
  import { track } from '$lib/analytics';
  import FormService from '$lib/components/FormService.svelte';
  import ModalConfirmDelete from '$lib/components/ModalConfirmDelete.svelte';
  import { mutate } from '$lib/mutations';
  import { refroute } from '$lib/navigation';
  import { route } from '$lib/ROUTES';
  import { toasts } from '$lib/toasts';
  import type { PageData } from './$types';

  export let data: PageData;
  const { service } = data;

  const DeleteService = graphql(`
    mutation DeleteService($id: LocalID!) {
      deleteService(id: $id) {
        ...MutationErrors
        ... on MutationDeleteServiceSuccess {
          data {
            id
          }
        }
      }
    }
  `);
</script>

<ModalConfirmDelete
  on:confirm={async () => {
    toasts.success('Service supprimé', '', {
      lifetime: 5000,
      data: { id: service.id, confirm: true },
      labels: { action: 'Annuler', close: 'OK' },
      async action({ data, id }) {
        data.confirm = false;
        track('service-delete-cancelled', { id });
        await toasts.remove(id);
        await goto(refroute('/services/[id]/edit', service.localID));
      },
      async closed({ data: { id, confirm } }) {
        if (!confirm) return;
        const result = await mutate(DeleteService, { id });
        toasts.mutation(result, 'deleteService', '', 'Impossible de supprimer le service');
      },
    });
    await goto(route('/services/manage'));
  }}
/>

<div class="content">
  <FormService {service} />
</div>

<style>
  .content {
    max-width: 600px;
    margin: 0 auto;
  }
</style>
