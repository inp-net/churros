<script lang="ts">
  import { goto } from '$app/navigation';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputText from '$lib/components/InputText.svelte';

  let code: string;
</script>

<main>
  <h1>Réclamer un code de promotion</h1>

  <form
    on:submit|preventDefault={async () => {
      await goto(`/claim-code/${encodeURIComponent(code)}`);
    }}
  >
    <InputText bind:value={code} label="Code de promotion" />
    <section class="submit">
      <ButtonPrimary submits>Réclamer</ButtonPrimary>
    </section>
  </form>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
</style>
