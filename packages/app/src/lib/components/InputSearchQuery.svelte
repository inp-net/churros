<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import IconSearch from '~icons/mdi/magnify';
  import BaseInputText from '$lib/components/BaseInputText.svelte';

  export let q: string | null;
  const emit = createEventDispatcher<{ search: string }>();
  export let placeholder = 'Recherche…';
</script>

<form class="query" method="get" on:submit|preventDefault={() => emit('search', q)}>
  <slot />
  <BaseInputText
    actionIcon={IconSearch}
    on:action={() => emit('search', q)}
    type="text"
    {placeholder}
    bind:value={q}
    autofocus
  />
</form>
