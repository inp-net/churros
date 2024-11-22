<script lang="ts">
  import { pushState } from '$app/navigation';
  import { page } from '$app/stores';
  import CardBooking from '$lib/components/CardBooking.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import Alert from '$lib/components/Alert.svelte';
  import AvatarGroup from '$lib/components/AvatarGroup.svelte';
  import ButtonLike from '$lib/components/ButtonLike.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import CardTicket from '$lib/components/CardTicket.svelte';
  import HTMLContent from '$lib/components/HTMLContent.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import PillLink from '$lib/components/PillLink.svelte';
  import TextEventDates from '$lib/components/TextEventDates.svelte';
  import { sentenceJoin } from '$lib/i18n';
  import { LoadingText, loading, mapAllLoading } from '$lib/loading';
  import { refroute } from '$lib/navigation';
  import IconDate from '~icons/msl/calendar-today-outline';
  import IconLocation from '~icons/msl/location-on-outline';
  import type { PageData } from './$houdini';
  import ModalBookTicket from './ModalBookTicket.svelte';
  import { copyToClipboard } from '$lib/components/ButtonCopyToClipboard.svelte';
  import CardArticle from '$lib/components/CardArticle.svelte';
  export let data: PageData;

  $: ({ PageEventDetail, RootLayout } = data);

  const ORGANIZERS_LIMIT = 3;

  let openOrganizersDetailModal: () => void;

  let bookingTicketId: string | undefined = undefined;

  let bookTicket: () => void;

  $: if ($page.url.hash.startsWith('#book/'))
    bookingTicketId = $page.url.hash.replace('#book/', '');

  $: if (bookingTicketId) bookTicket?.();
</script>

<svelte:window
  on:NAVTOP_COPY_ID={async () => {
    await copyToClipboard(loading($PageEventDetail.data?.event.id, '') ?? '');
  }}
/>

<MaybeError result={$PageEventDetail} let:data={{ event, me }}>
  {@const highlightedBooking = event.highlightedBooking.at(0)}
  {@const tooManyOrganizers = [event.organizer, ...event.coOrganizers].length > ORGANIZERS_LIMIT}
  {#if tooManyOrganizers}
    <ModalOrDrawer removeBottomPadding bind:open={openOrganizersDetailModal}>
      <h2 slot="header" class="all-organizers">Groupes organisateurs</h2>
      <ul class="nobullet avatars-details">
        {#each [event.organizer, ...event.coOrganizers] as group}
          <li class="avatar">
            <AvatarGroup name {group} />
          </li>
        {/each}
      </ul>
    </ModalOrDrawer>
  {/if}
  <ModalBookTicket
    {me}
    ticket={event.tickets.find((t) => t.localID === bookingTicketId) ?? null}
    bind:open={bookTicket}
    on:close={() => {
      pushState('#', { bookingTicketId: null });
    }}
  />
  <div class="contents">
    {#if highlightedBooking}
      <CardBooking
        booking={highlightedBooking}
        hasMoreBookingsCount={event.myBookings.length - 1}
      />
    {/if}
    <header>
      <svelte:element
        this={tooManyOrganizers ? 'button' : 'div'}
        class="organizers"
        on:click={openOrganizersDetailModal}
        role={tooManyOrganizers ? 'button' : undefined}
      >
        <ul class="nobullet avatars">
          {#each [event.organizer, ...event.coOrganizers].slice(0, ORGANIZERS_LIMIT) as group}
            <li class="avatar">
              <AvatarGroup href={tooManyOrganizers ? '' : undefined} {group} />
            </li>
          {/each}
          {#if tooManyOrganizers}
            <li class="avatar">
              +{[event.organizer, ...event.coOrganizers].length - ORGANIZERS_LIMIT}
            </li>
          {/if}
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
      </svelte:element>
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
        {#each event.links.filter((l) => loading(l.rawURL, null) !== event.externalTicketing?.toString()) as link}
          <PillLink {link} />
        {/each}
      </ul>
    {/if}
    <HTMLContent tag="main" html={event.descriptionHtml}></HTMLContent>
    <section class="tickets">
      {#if event.externalTicketing}
        <CardTicket ticket={null} externalURL={event.externalTicketing} />
      {/if}
      {#each event.tickets as ticket}
        <CardTicket
          on:book={({ detail }) => {
            bookingTicketId = detail;
            bookTicket?.();
          }}
          {ticket}
          details={ticket}
          places={ticket}
        />
      {:else}
        {#if !$RootLayout.data?.loggedIn}
          <Alert theme="warning">
            Il est possible que tu doive <a data-sveltekit-reload href={refroute('/login')}
              >te connecter</a
            > pour réserver une place
          </Alert>
        {/if}
      {/each}
    </section>

    <section class="actions">
      <ButtonLike resource={event} />
      <ButtonShare resource={event} />
    </section>

    {#if event.posts.length > 0}
      <section class="articles">
        <h2>Actus</h2>
        {#each event.posts as article}
          <CardArticle hideEvent {article} />
        {/each}
      </section>
    {/if}
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
    gap: 0.5rem;
    align-items: center;
    margin-right: 0.5em;
  }

  header .organizers .avatar {
    display: flex;
    align-items: center;
  }

  header .organizers .text {
    display: flex;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

  h2.all-organizers {
    width: 100%;
    margin-bottom: 1rem;
    text-align: center;
  }

  .avatars-details {
    display: flex;
    flex-direction: column;

    --avatar-size: 3rem;

    gap: 1rem;
    padding: 0 2rem;
  }

  .tickets {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .articles {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>
