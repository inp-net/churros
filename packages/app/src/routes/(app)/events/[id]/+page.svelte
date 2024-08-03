<script lang="ts">
  import Alert from '$lib/components/Alert.svelte';
  import AvatarGroup from '$lib/components/AvatarGroup.houdini.svelte';
  import ButtonLike from '$lib/components/ButtonLike.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import CardTicket from '$lib/components/CardTicket.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import PillLink from '$lib/components/PillLink.svelte';
  import TextEventDates from '$lib/components/TextEventDates.svelte';
  import { sentenceJoin } from '$lib/i18n';
  import { mapAllLoading } from '$lib/loading';
  import { refroute } from '$lib/navigation';
  import IconDate from '~icons/msl/calendar-today-outline';
  import IconLocation from '~icons/msl/location-on-outline';
  import type { PageData } from './$houdini';
  import HTMLContent from './HTMLContent.svelte';
  export let data: PageData;

  $: ({ PageEventDetail, RootLayout } = data);
  // HINT: Don't forget to add an entry in $lib/navigation.ts for the top navbar's title and/or action buttons
</script>

<MaybeError result={$PageEventDetail} let:data={{ event }}>
  <div class="contents">
    <header>
      <div class="organizers">
        <ul class="nobullet avatars">
          {#each [event.organizer, ...event.coOrganizers] as group}
            <li class="avatar">
              <AvatarGroup {group} />
            </li>
          {/each}
        </ul>
        <div class="text">
          <LoadingText
            value={mapAllLoading(
              [event.organizer.name, ...event.coOrganizers.map((o) => o.name)],
              (...names) => sentenceJoin(names),
            )}
          >
            Chargement des organisateurs…
          </LoadingText>
        </div>
      </div>
      <h2 class="title"><LoadingText value={event.title}>Lorem dolor ipsum</LoadingText></h2>
      <section class="metadata">
        <div class="dates">
          <IconDate />
          <TextEventDates {event} />
        </div>
        {#if event.location}
          <div class="location">
            <IconLocation />
            <LoadingText value={event.location}>Chargement du lieu…</LoadingText>
          </div>
        {/if}
      </section>
    </header>
    {#if event.links.length > 0}
      <ul class="links nobullet">
        {#each event.links as link}
          <PillLink social {link} />
        {/each}
      </ul>
    {/if}
    <HTMLContent tag="main" html={event.descriptionHtml}></HTMLContent>
    <section class="tickets">
      {#each event.tickets as ticket}
        <CardTicket {ticket} places={ticket} />
      {:else}
        {#if !$RootLayout.data?.loggedIn}
          <Alert theme="warning">
            Il est possible que tu doive <a href={refroute('/login')}>te connecter</a> pour réserver
            une place
          </Alert>
        {/if}
      {/each}
    </section>

    <section class="actions">
      <ButtonLike resource={event} />
      <ButtonShare resource={event} />
    </section>
  </div>
</MaybeError>

<style>
  .contents {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  @media (max-width: 900px) {
    .contents {
      padding: 0 1rem;
    }
  }

  header {
    display: flex;
    flex-direction: column;
  }

  header .organizers {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 1rem;
    font-size: 1.2em;

    --avatar-size: 2rem;
  }

  header .organizers .avatars {
    display: flex;
    align-items: center;
  }

  header .organizers .avatar {
    display: flex;
    align-items: center;
  }

  header .organizers .text {
    display: flex;
    align-items: center;
  }

  header .title {
    font-size: 1.5rem;
    line-height: 1;
  }

  header .metadata {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
  }

  header .metadata > div {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    align-items: center;
  }

  .actions {
    display: flex;
    gap: 1em;
    align-items: center;
    font-size: 1.2em;
  }
</style>
