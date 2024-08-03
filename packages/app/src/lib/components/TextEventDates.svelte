<script lang="ts">
  import { fragment, graphql, PendingValue, type TextEventDates } from '$houdini';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { formatEventDates } from '$lib/dates';
  import { allLoaded } from '$lib/loading';

  export let event: TextEventDates | null;
  $: data = fragment(
    event,
    graphql(`
      fragment TextEventDates on Event @loading {
        startsAt
        endsAt
        frequency
        recurringUntil
      }
    `),
  );
</script>

<LoadingText value={$data && allLoaded($data) ? formatEventDates($data) : PendingValue}
  >Chargement des dates…</LoadingText
>
