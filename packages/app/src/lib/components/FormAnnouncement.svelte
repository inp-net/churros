<script lang="ts">
  import { goto } from '$app/navigation';
  import { fragment, graphql, type FormAnnouncement } from '$houdini';
  import { addDays } from 'date-fns';
  import Alert from './Alert.svelte';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import InputCheckbox from './InputCheckbox.svelte';
  import InputDate from './InputDate.svelte';
  import InputLongText from './InputLongText.svelte';
  import InputText from './InputText.svelte';
  import { toasts } from '$lib/toasts';

  export let announcement: FormAnnouncement | null;
  $: data = fragment(
    announcement,
    graphql(`
      fragment FormAnnouncement on Announcement {
        title
        body
        startsAt
        endsAt
        warning
        id
      }
    `),
  );

  $: ({ title, body, startsAt, endsAt, warning } = $data ?? {
    title: '',
    body: '',
    startsAt: new Date(),
    endsAt: addDays(new Date(), 1),
    warning: false,
    id: null,
  });

  let loading = false;

  $: startsAtAfterEndsAt =
    startsAt === undefined || endsAt === undefined ? true : startsAt.getTime() > endsAt.getTime();
  $: dateIsInvalid = startsAtAfterEndsAt;

  async function saveChanges() {
    loading = true;
    const result = await graphql(`
      mutation UpsertAnnouncement(
        $id: ID
        $title: String!
        $body: String!
        $startsAt: DateTime!
        $endsAt: DateTime!
        $warning: Boolean!
      ) {
        upsertAnnouncement(
          id: $id
          title: $title
          body: $body
          startsAt: $startsAt
          endsAt: $endsAt
          warning: $warning
        ) {
          ... on MutationUpsertAnnouncementSuccess {
            data {
              ...FormAnnouncement
            }
          }
          ...MutationErrors
        }
      }
    `).mutate({ id: $data?.id, title, body, startsAt, endsAt, warning });

    if (
      toasts.mutation(
        result,
        'upsertAnnouncement',
        'Annonce sauvegardée',
        "Impossible de sauvegarder l'annonce",
      )
    )
      await goto('/announcements');
    else loading = false;
  }
</script>

<form on:submit|preventDefault={saveChanges}>
  <InputText label="Titre" maxlength={255} bind:value={title} />
  <InputLongText rich label="Message" bind:value={body} />
  <div class="side-by-side">
    <InputDate time label="Début" bind:value={startsAt} />
    <InputDate time label="Fin" bind:value={endsAt} />
  </div>
  <InputCheckbox bind:value={warning} label="Avertissement" />

  <section class="submit">
    <ButtonPrimary {loading} submits disabled={dateIsInvalid}>Sauvegarder</ButtonPrimary>
  </section>
</form>
<section class="errors">
  {#if startsAtAfterEndsAt}
    <Alert theme="danger">
      Impossible de programmer l'évenement : La date de fin est avant celle du début.
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
