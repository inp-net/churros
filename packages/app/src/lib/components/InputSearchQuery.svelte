<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import IconSearch from '~icons/mdi/magnify';
  import IconClear from '~icons/mdi/close';
  import BaseInputText from '$lib/components/BaseInputText.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  export let q: string | null;
  const emit = createEventDispatcher<{ search: string | null }>();
  export let placeholder = 'Recherche…';
  export let searching = false;
</script>

<form class="query" method="get" on:submit|preventDefault={() => emit('search', q)}>
  <slot />
  <BaseInputText
    actionIcon={q ? IconClear : undefined}
    on:action={() => {
      q = '';
      emit('search', q);
    }}
    type="text"
    {placeholder}
    bind:value={q}
    autofocus
  >
    <svelte:fragment slot="before">
      {#if searching}
        <LoadingSpinner />
      {:else}
        <IconSearch />
      {/if}
    </svelte:fragment>
  </BaseInputText>
</form>
