<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import IconSearch from '~icons/msl/search';
  import IconClear from '~icons/msl/close';
  import BaseInputText from '$lib/components/BaseInputText.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import { debounce } from 'lodash';

  export let autofocus = false;
  export let q: string | null;
  const emit = createEventDispatcher<{ search: string | null; debouncedInput: string | null }>();
  export let placeholder = 'Recherche…';
  export let searching = false;

  const dispatchInputEvent = (value: string | null) => {
    emit('debouncedInput', value);
  };

  const debouncedDispatchInputEvent = debounce(dispatchInputEvent, 300);
  $: debouncedDispatchInputEvent(q);
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
    {autofocus}
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

<style lang="scss">
  form.query {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    max-width: 1000px;
    margin: 0 1rem;
    margin-bottom: 1rem;

    > :global(.base-input) {
      width: 100%;
    }
  }
</style>
