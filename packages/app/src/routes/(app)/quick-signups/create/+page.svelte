<script lang="ts">
  import { goto } from '$app/navigation';
  import { graphql } from '$houdini';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputDate from '$lib/components/InputDate.svelte';
  import InputSchools, { type School } from '$lib/components/InputSchools.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { allLoaded } from '$lib/loading';
  import { toasts } from '$lib/toasts';
  import { addWeeks } from 'date-fns';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageQuickSignupCreate } = data);

  let school: School | undefined;
  let validUntil = addWeeks(new Date(), 1);

  const Create = graphql(`
    mutation CreateQuickSignup($validUntil: DateTime!, $school: String!) {
      createQuickSignup(validUntil: $validUntil, school: $school) {
        code
      }
    }
  `);

  $: if (!school && $PageQuickSignupCreate?.data && allLoaded($PageQuickSignupCreate.data)) 
    school = $PageQuickSignupCreate.data.me?.major?.schools[0];
  
</script>

<MaybeError result={$PageQuickSignupCreate}>
  <div class="contents">
    <form
      on:submit|preventDefault={async () => {
        if (!school) return;
        const { data, errors } = await Create.mutate({ validUntil, school: school.uid });
        if (data) {await goto(`../manage#${data.createQuickSignup.code}`);}
        else {
          toasts.error(
            'Erreur lors de la création du lien',
            errors?.map((e) => e.message).join('; ') ?? 'Erreur inconnue',
          );
        }
      }}
    >
      <InputSchools required label="École" bind:school></InputSchools>
      <InputDate time required name="validUntil" bind:value={validUntil} label="Valide jusqu'au"
      ></InputDate>
      <section class="submit">
        <ButtonPrimary submits>Créer</ButtonPrimary>
      </section>
    </form>
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }

  form {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
  }

  .submit {
    display: flex;
    justify-content: center;
  }
</style>
