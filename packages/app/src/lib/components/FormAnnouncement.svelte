<script lang="ts">
  import { goto } from '$app/navigation';
  import { zeus } from '$lib/zeus';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import InputCheckbox from './InputCheckbox.svelte';
  import InputDate from './InputDate.svelte';
  import InputLongText from './InputLongText.svelte';
  import InputText from './InputText.svelte';

  export let data: {
    title: string;
    body: string;
    startsAt: Date;
    endsAt: Date;
    warning: boolean;
    id: string;
  };

  let loading = false;

  async function saveChanges() {
    loading = true;
    const { upsertAnnouncement } = await $zeus.mutate({
      upsertAnnouncement: [
        {
          id: data.id,
          title: data.title,
          body: data.body,
          startsAt: data.startsAt.toISOString(),
          endsAt: data.endsAt.toISOString(),
          warning: data.warning,
        },
        {
          title: true,
          body: true,
          startsAt: true,
          endsAt: true,
          warning: true,
          id: true,
        },
      ],
    });
    loading = false;
    data = upsertAnnouncement;
    await goto('/announcements');
  }
</script>

<form on:submit|preventDefault={saveChanges}>
  <InputText label="Titre" bind:value={data.title} />
  <InputLongText rich label="Message" bind:value={data.body} />
  <div class="side-by-side">
    <InputDate time label="Début" bind:value={data.startsAt} />
    <InputDate time label="Fin" bind:value={data.endsAt} />
  </div>
  <InputCheckbox bind:value={data.warning} label="Avertissement" />

  <section class="submit">
    <ButtonPrimary {loading} submits>Sauvegarder</ButtonPrimary>
  </section>
</form>

<style>
  form {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
  }

  .side-by-side {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }

  .submit {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }
</style>
