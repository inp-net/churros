<script lang="ts">
  import InputVisibility from '$lib/components/InputVisibility.houdini.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import type { PageData } from './$houdini';
  export let data: PageData;

  $: ({ PageEventEditVisibility } = data);
  // HINT: Don't forget to add an entry in $lib/navigation.ts for the top navbar's title and/or action buttons
</script>

<MaybeError result={$PageEventEditVisibility} let:data={{ event }}>
  <InputVisibility value={event.visibility} />
</MaybeError>
