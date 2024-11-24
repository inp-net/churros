<script lang="ts">
  import { fragment, graphql, type FormAnnouncement } from '$houdini';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputDateTime from '$lib/components/InputDateTime.svelte';
  import InputDateTimeRange from '$lib/components/InputDateTimeRange.svelte';
  import InputTextGhost from '$lib/components/InputTextGhost.svelte';
  import InputToggle from '$lib/components/InputToggle.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { formatDateTimeSmart } from '$lib/dates';
  import { allLoaded, mapLoading } from '$lib/loading';
  import { toasts } from '$lib/toasts';
  import { addDays } from 'date-fns';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ saved: { localID: string } }>();

  export let announcement: FormAnnouncement | null;
  $: data = fragment(
    announcement,
    graphql(`
      fragment FormAnnouncement on Announcement @loading {
        title
        body
        startsAt
        endsAt
        warning
        id
        createdAt
        updatedAt
        by {
          ...AvatarUser
        }
      }
    `),
  );

  let { title, body, startsAt, endsAt, warning } = {
    title: '',
    body: '',
    startsAt: new Date(),
    endsAt: addDays(new Date(), 1),
    warning: false,
  };

  $: creating = !$data;

  let dirty = false;
  $: if (!dirty && $data && allLoaded($data)) ({ title, body, startsAt, endsAt, warning } = $data);

  let loading = false;

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
              localID
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
      dispatch('saved', result.data.upsertAnnouncement.data);
    loading = false;
  }
</script>

<form on:submit|preventDefault={saveChanges}>
  <Submenu>
    <SubmenuItem icon={null} label>
      <InputTextGhost
        on:input={() => {
          dirty = true;
        }}
        label=""
        placeholder="Titre de l'annonce"
        maxlength={255}
        bind:value={title}
      />
    </SubmenuItem>
    <SubmenuItem icon={null} label subtext="Syntaxe Markdown supportée">
      <InputTextGhost
        on:input={() => {
          dirty = true;
        }}
        label="Message"
        placeholder="Message de l'annonce"
        bind:value={body}
      />
    </SubmenuItem>
    <InputDateTimeRange
      variant="ghost"
      start={startsAt}
      end={endsAt}
      on:update={async ({ detail: dates }) => {
        if (!dates) return;
        startsAt = dates.start;
        endsAt = dates.end;
      }}
    >
      <SubmenuItem slot="start" icon={null} label subtext="Ne pas afficher avant cette date">
        Début
        <InputDateTime slot="right" variant="ghost" value={startsAt} label=""></InputDateTime>
      </SubmenuItem>
      <SubmenuItem slot="end" icon={null} label subtext="Cacher après cette date">
        Fin
        <InputDateTime slot="right" variant="ghost" value={endsAt} label=""></InputDateTime>
      </SubmenuItem>
    </InputDateTimeRange>
    <SubmenuItem label icon={null} subtext="L'annonce est un avertissement">
      Avertissement
      <InputToggle
        slot="right"
        on:update={({ detail }) => {
          dirty = true;
          warning = detail;
        }}
        value={warning}
      />
    </SubmenuItem>
  </Submenu>

  {#if $data}
    <p class="metadata">
      Dernière modification: <LoadingText
        value={mapLoading($data.updatedAt, formatDateTimeSmart)}
      />
      par <AvatarUser name user={$data.by} />
    </p>
  {/if}

  <section class="submit">
    <ButtonPrimary {loading} submits>
      {#if creating}Créer{:else}Sauvegarder{/if}
    </ButtonPrimary>
  </section>
</form>

<style>
  form {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
  }

  .metadata {
    font-size: 0.8rem;
    text-align: center;
  }

  .submit {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }
</style>
