<script lang="ts">
  import Button from '$lib/components/buttons/Button.svelte';

  import FormCard from '$lib/components/cards/FormCard.svelte';
  import FormInput from '$lib/components/inputs/FormInput.svelte';
  import type { ZodFormattedError } from 'zod';
  import type { PageData } from './$types';

  export let data: PageData;

  let { firstName, lastName } = data.userCandidateByEmail;

  $: args = { firstName, lastName };
  let formErrors: ZodFormattedError<typeof args> | undefined;
</script>

<FormCard large title="Modifier une inscription">
  <p class="grid gap-4 desktop:grid-cols-2">
    <FormInput label="Prénom :" errors={formErrors?.firstName?._errors}>
      <input type="text" bind:value={firstName} required />
    </FormInput>
    <FormInput label="Nom de famille :" errors={formErrors?.lastName?._errors}>
      <input type="text" bind:value={lastName} required />
    </FormInput>
  </p>
  <p class="text-center">
    <Button type="submit" theme="primary">Sauvegarder</Button>
    <Button type="submit" theme="success">Sauvegarder et inscrire</Button>
    <Button type="submit" theme="danger">Refuser</Button>
    <a href="../..">Retour à la liste</a>
  </p>
</FormCard>
