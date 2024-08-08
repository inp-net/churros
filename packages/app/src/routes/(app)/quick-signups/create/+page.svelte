<script lang="ts">
  import InputDate from '$lib/components/InputDate.svelte';
  import InputSchools, { type School } from '$lib/components/InputSchools.svelte';
  import { addDays } from 'date-fns';
  import type { PageData } from './$types';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import { zeus } from '$lib/zeus';
  import { goto } from '$app/navigation';

  export let data: PageData;

  let school: School | undefined = data.me?.major?.schools[0];
  let validUntil = addDays(new Date(), 1);
</script>

<main>
  <h1>Créer un lien d'inscription rapide</h1>

  <form
    on:submit|preventDefault={async () => {
      if (!school) return;
      const {
        createQuickSignup: { code },
      } = await $zeus.mutate({
        createQuickSignup: [{ validUntil, school: school.uid }, { code: true }],
      });

      await goto(`../manage#${code}`);
    }}
  >
    <InputSchools required label="École" bind:school></InputSchools>
    <InputDate time required name="validUntil" bind:value={validUntil} label="Valide jusqu'au"
    ></InputDate>
    <input type="hidden" name="schoolUid" value={school?.uid} />
    <input type="hidden" name="token" value={data.token} />
    <section class="submit">
      <ButtonPrimary submits>Créer</ButtonPrimary>
    </section>
  </form>
</main>

<style>
  main {
    max-width: 600px;
    margin: 0 auto;
  }

  section.submit {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
  }
</style>
