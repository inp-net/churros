<script lang="ts">
  import type { QueryResult } from '$houdini';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  // generics="..." should be supported by svelte-eslint-plugin since svelte-eslint-parser@0.34.0
  // but it still doesn't work...
  type Result = $$Generic;
  type Input = $$Generic;

  export let result: QueryResult<Result, Input> | null;

  $: resultDataNonNull = result!.data as Result;
</script>

{#if result && result.data}
  <slot data={resultDataNonNull}></slot>
{:else if result?.errors}
  <h2>Oops!</h2>
  <p>Une erreur est survenue.</p>
  <ul>
    {#each result?.errors as { message }}
      <li>{message}</li>
    {/each}
  </ul>
{:else}
  <LoadingSpinner></LoadingSpinner> Chargement…
{/if}
