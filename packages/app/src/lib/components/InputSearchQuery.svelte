<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import IconSearch from '~icons/mdi/magnify';
  import IconClear from '~icons/mdi/close';
  import BaseInputText from '$lib/components/BaseInputText.svelte';

  export let q: string | null;
  const emit = createEventDispatcher<{ search: string | null }>();
  export let placeholder = 'Recherche…';
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
    <IconSearch slot="before" />
  </BaseInputText>
</form>
