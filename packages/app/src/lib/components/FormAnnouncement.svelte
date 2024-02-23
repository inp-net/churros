<script lang="ts">
  import { goto } from '$app/navigation';
  import { zeus } from '$lib/zeus';
  import { isPast } from 'date-fns';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import InputCheckbox from './InputCheckbox.svelte';
  import InputDate from './InputDate.svelte';
  import InputLongText from './InputLongText.svelte';
  import InputText from './InputText.svelte';
  import Alert from './Alert.svelte';

  export let data: {
    title: string;
    body: string;
    startsAt: Date;
    endsAt: Date;
    warning: boolean;
    id: string;
  };

  let loading = false;

  $: startsAtAfterEndsAt =
    data.startsAt === undefined || data.endsAt === undefined
      ? true
      : data.startsAt.getTime() > data.endsAt.getTime();
  $: pastDateStart = data.startsAt === undefined ? false : isPast(data.startsAt);
  $: isNotValidDate = startsAtAfterEndsAt || pastDateStart;

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
  <InputText label="Titre" maxlength={255} bind:value={data.title} />
  <InputLongText rich label="Message" bind:value={data.body} />
  <div class="side-by-side">
    <InputDate time label="Début" bind:value={data.startsAt} />
    <InputDate time label="Fin" bind:value={data.endsAt} />
  </div>
  <InputCheckbox bind:value={data.warning} label="Avertissement" />

  <section class="submit">
    <ButtonPrimary {loading} submits disabled={isNotValidDate}>Sauvegarder</ButtonPrimary>
  </section>
</form>
<section class="errors">
  {#if startsAtAfterEndsAt}
    <Alert theme="danger">
      Impossible de programmer l'évenement : La date de fin est avant celle du début.
    </Alert>
  {/if}
  {#if pastDateStart}
    <Alert theme="danger">
      Impossible de programmer l'événement : La date indiquée est déjà passé.
    </Alert>
  {/if}
</section>

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
