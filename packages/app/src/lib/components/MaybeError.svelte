<script lang="ts">
  import { refroute } from '$lib/navigation';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import type { QueryResult } from '$houdini';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import Alert from '$lib/components/Alert.svelte';
  import { page } from '$app/stores';

  // generics="..." should be supported by svelte-eslint-plugin since svelte-eslint-parser@0.34.0
  // but it still doesn't work...
  type Result = $$Generic;
  type Input = $$Generic;

  $: ({ RootLayout } = $page.data);
  $: loggedIn = $RootLayout?.data?.loggedIn;

  export let result: QueryResult<Result, Input> | null;

  $: resultDataNonNull = result!.data as Result;
</script>

{#if result && result.data}
  <slot data={resultDataNonNull}></slot>
{:else if result?.errors}
  <Alert theme="danger">
    <h2>Oops!</h2>
    {#if result.errors.length > 1}
      <ul>
        {#each result?.errors as { message }}
          <li>{message}</li>
        {/each}
      </ul>
    {:else if result.errors.length === 1}
      <p>{result.errors[0].message}</p>
    {:else}
      <p>Une erreur est survenue.</p>
    {/if}
    {#if !loggedIn}
      <ButtonSecondary href={refroute('/login')}>Se connecter</ButtonSecondary>
    {/if}
  </Alert>
{:else}
  <LoadingSpinner></LoadingSpinner> Chargement…
{/if}
