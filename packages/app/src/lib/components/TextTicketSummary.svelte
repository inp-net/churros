<script lang="ts">
  import { fragment, graphql, type TextTicketSummary } from '$houdini';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { mapAllLoading } from '$lib/loading';

  export let ticket: TextTicketSummary | null;
  $: data = fragment(
    ticket,
    graphql(`
      fragment TextTicketSummary on Ticket {
        capacity
        minimumPrice
        openToAlumni
        openToApprentices
        openToContributors
        openToExternal
        openToGroups {
          uid
        }
        openToMajors {
          uid
        }
        openToPromotions
      }
    `),
  );
</script>

{#if $data}
  <LoadingText
    value={mapAllLoading([$data.capacity, $data.minimumPrice], (cap, price) =>
      [
        cap === null
          ? ''
          : cap === 'Unlimited'
            ? 'Places illimitées'
            : `${cap} place${cap > 1 ? 's' : ''}`,
        price === 0 ? 'Gratuit' : `${price}€`,
      ].join(' · '),
    )}>.. places . xE . Contraintes</LoadingText
  >
{/if}
