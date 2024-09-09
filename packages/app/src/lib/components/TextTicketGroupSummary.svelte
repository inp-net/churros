<script lang="ts">
  import { fragment, graphql, type TextTicketGroupSummary } from '$houdini';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { sentenceJoin } from '$lib/i18n';
  import { mapAllLoading } from '$lib/loading';

  export let group: TextTicketGroupSummary | null;
  $: data = fragment(
    group,
    graphql(`
      fragment TextTicketGroupSummary on TicketGroup {
        capacity
        ticketsCount
        tickets {
          name
        }
      }
    `),
  );
</script>

{#if $data}
  <LoadingText
    value={mapAllLoading(
      [$data.capacity, $data.ticketsCount, $data.tickets],
      (cap, count, tickets) =>
        [
          cap === null ? 'Places illimitées' : `${cap} place${cap > 1 ? 's' : ''}`,
          count === 0
            ? 'Aucun billet'
            : count > 3
              ? `${count} billets`
              : sentenceJoin(tickets.map((ticket) => ticket.name)),
        ].join(' · '),
    )}>.. places . xE . Contraintes</LoadingText
  >
{/if}
