<script lang="ts">
  import { page } from '$app/stores';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputRadios from '$lib/components/InputRadios.svelte';
  import LoadingChurros from '$lib/components/LoadingChurros.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { allLoaded, type MaybeLoading } from '$lib/loading';
  import { mutateAndToast } from '$lib/mutations';
  import { route } from '$lib/ROUTES';
  import { UpdateGroupOfTicket } from '../mutations';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageEventEditGroupOfTicket } = data);

  // Needed because typeof PendingValue gets reduced to symbol when passing through slot props of <InputRadios>
  const asMaybeLoading = <T,>(value: T | symbol): MaybeLoading<T> => value as MaybeLoading<T>;
</script>

<MaybeError result={$PageEventEditGroupOfTicket} let:data={{ event }}>
  {@const ticket = event.ticket}
  {#if ticket}
    <div class="contents">
      {#if !allLoaded(event.ticketGroups)}
        <LoadingChurros />
      {:else if event.ticketGroups.length === 0}
        <Alert theme="warning">
          Aucun groupe de billets n'a été créé pour cet événement. <ButtonSecondary
            insideProse
            href="{route('/events/[id]/edit/tickets', $page.params.id)}#groups"
            >En créer un</ButtonSecondary
          >
        </Alert>
      {:else}
        <InputRadios
          options={Object.fromEntries([
            ['', 'Aucun'],
            ...event.ticketGroups.map((group) => [group.id, group.name]),
          ])}
          value={ticket.group?.id ?? null}
          on:change={async ({ detail }) => {
            await mutateAndToast(
              UpdateGroupOfTicket,
              {
                ticket: ticket.id,
                group: detail || null,
              },
              {
                error: 'Impossible de changer le groupe du billet',
              },
            );
          }}
        >
          <LoadingText
            slot="label"
            let:option
            tag={option ? 'span' : 'em'}
            let:label
            value={asMaybeLoading(label)}
          ></LoadingText>
        </InputRadios>
      {/if}
    </div>
  {:else}
    <Alert theme="danger">Billet non trouvé</Alert>
  {/if}
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }
</style>
