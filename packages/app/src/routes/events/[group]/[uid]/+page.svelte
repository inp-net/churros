<script lang="ts">
  import ItemTicket from '$lib/components/ItemTicket.svelte';
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import { formatDate, formatDateTime } from '$lib/dates';
  import IconPlus from '~icons/mdi/plus';
  import { me } from '$lib/session';
  import { format, isSameDay } from 'date-fns';
  import type { PageData } from './$types';
  import BackButton from '$lib/components/ButtonBack.svelte';
  import CardArticle from '$lib/components/CardArticle.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';

  export let data: PageData;

  const {
    id,
    title,
    startsAt,
    pictureFile,
    descriptionHtml,
    links,
    group,
    contactMail,
    articles,
    endsAt,
    location,
  } = data.event;

  const tickets = data.ticketsOfEvent;

  $: usersRegistration = tickets
    .flatMap((t) => t.registrations)
    .filter(({ beneficiary, author }) => author.uid === $me?.uid || beneficiary === $me?.uid);

  $: eventCapacity = tickets.reduce(
    (sum, { capacity, group }) =>
      sum + Math.min(capacity, group?.capacity ?? Number.POSITIVE_INFINITY),
    0
  );

  $: eventPlacesLeft = tickets.reduce((sum, { placesLeft }) => sum + placesLeft, 0);

  const bookingURL = (registrationId: string) =>
    `/bookings/${registrationId.split(':', 2)[1].toUpperCase()}`;

  function formatEventDates(startsAt: Date, endsAt: Date): string {
    if (isSameDay(startsAt, endsAt)) {
      return `Le ${formatDate(startsAt)}, de ${format(startsAt, 'HH:mm')} à ${format(
        endsAt,
        'HH:mm'
      )}`;
    }

    return `${formatDateTime(startsAt)} — ${formatDateTime(endsAt)}`;
  }
</script>

<header
  style:background-image="linear-gradient(#000000aa, #000000aa), url({pictureFile
    ? `${PUBLIC_STORAGE_URL}${pictureFile}`
    : 'https://picsum.photos/400/400'})"
>
  <h1>
    <BackButton go="../.." white />
    {title}
    <ButtonShare white />
  </h1>
  <p class="when">{formatEventDates(startsAt, endsAt)}</p>
  <p class="where">{location}</p>
</header>

<ul class="nobullet bookings">
  {#each usersRegistration as { ticket, beneficiary, author, authorIsBeneficiary, beneficiaryUser, id }}
    <li>
      <ButtonPrimary href={bookingURL(id)}
        >{#if authorIsBeneficiary || author.uid !== $me?.uid}Ma place{:else}Place pour {#if beneficiaryUser}{beneficiaryUser.firstName}
            {beneficiaryUser.lastName}{:else}{beneficiary}{/if}{/if}
        <span class="ticket-name">{ticket.name}</span></ButtonPrimary
      >
    </li>
  {/each}
</ul>

<section class="description">
  {@html descriptionHtml}

  {#if links.length > 0}
    <ul class="links">
      {#each links as link}
        <li><a href={link.computedValue}>{link.name}</a></li>
      {/each}
    </ul>
  {/if}
</section>

{#if eventCapacity > 0}
  <section class="tickets">
    <h2>
      Places <span class="places">
        {#if eventPlacesLeft < 0}
          illimitées
        {:else}
          <span class="left">{eventPlacesLeft} restantes</span><span class="capacity"
            >{eventCapacity}</span
          >
        {/if}
      </span>
    </h2>

    <ul class="nobullet">
      {#each tickets.sort( (a, b) => (a.group?.name ?? '').localeCompare(b.group?.name ?? '') ) as { id, ...ticket } (id)}
        <li>
          <ItemTicket {...ticket} event={data.event} />
        </li>
      {/each}
    </ul>
  </section>
{/if}
<section class="news">
  <h2>
    Actualités

    {#if $me?.admin || $me?.managedEvents.some(({ event, canEdit }) => event.id === id && canEdit)}
      <ButtonSecondary icon={IconPlus} href="./write">Post</ButtonSecondary>
    {/if}
  </h2>
  <ul class="nobullet">
    {#each articles as { uid, ...article } (uid)}
      <li>
        <CardArticle href="/posts/{group.uid}/{uid}/" {...article} />
      </li>
    {:else}
      <li class="empty muted">Aucun post pour le moment.</li>
    {/each}
  </ul>
</section>

<section class="organizer">
  <h2>Organisé par</h2>
  <div class="organizer-name-and-contact">
    <a class="organizer-name" href="/groups/{group.uid}">
      <img
        src={group.pictureFile
          ? `${PUBLIC_STORAGE_URL}${group.pictureFile}`
          : 'https://via.placeholder.com/400/400'}
        alt=""
      />
      {group.name}
    </a>
    <ButtonSecondary href="mailto:{contactMail}">Contact</ButtonSecondary>
  </div>
</section>

<style lang="scss">
  header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 1rem;
    background-size: cover;

    > * {
      margin: 0;
      color: white;
    }
  }

  h1 {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  section {
    max-width: 1000px;
    padding: 0 1rem;
    margin: 0 auto;
    margin-top: 2rem;
  }

  h2 {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1rem;
  }

  .places {
    display: inline-block;
  }

  h2 .places {
    margin-left: auto;
  }

  .tickets ul {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    margin: 0 1rem;
  }

  .places .left::after {
    display: inline-block;
    height: 1.25em;
    margin: 0.3em;
    margin-bottom: -0.25em;
    content: '';
    background: var(--text);
    transform: rotate(30deg);
  }

  h2 .places .left::after {
    width: 3px;
  }

  .ticket .places .left::after {
    width: 1px;
  }

  .organizer-name-and-contact {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .organizer-name {
    display: flex;
    gap: 0.5rem;
    align-items: center;

    img {
      width: 3rem;
      height: 3rem;
      object-fit: contain;
    }
  }

  ul.bookings {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    margin: 2rem 0;
  }
</style>
