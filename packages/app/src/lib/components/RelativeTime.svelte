<script lang="ts">
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { formatDateRelativeSmart, formatDateTime } from '$lib/dates';
  import { mapLoading, onceLoaded, type MaybeLoading } from '$lib/loading';

  interface Props {
    /** The date to display */
    date: MaybeLoading<Date> | null | undefined;
  }

  const { date }: Props = $props();
</script>

<LoadingText
  tag="time"
  datetime={onceLoaded(date, (d) => d?.toISOString(), '')}
  value={mapLoading(date, formatDateRelativeSmart)}
  help={onceLoaded(date, (d) => (d ? formatDateTime(date) : ''), '')}
/>
