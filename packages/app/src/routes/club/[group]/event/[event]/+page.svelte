<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import { dateTimeFormatter } from '$lib/dates';
  import IconPlus from '~icons/mdi/plus';
  import { me } from '$lib/session';
  import { formatRelative, isFuture, isPast } from 'date-fns';
  import type { PageData } from './$types';
  import BackButton from '$lib/components/ButtonBack.svelte';
  import CardArticle from '$lib/components/CardArticle.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';

  export let data: PageData;

  $: console.log(data);

  const { id, title, startsAt, pictureFile, descriptionHtml, links, group, contactMail, articles } =
    data.event;

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
  <p>{dateTimeFormatter.format(startsAt)}</p>
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
      {#each tickets as { name, uid, descriptionHtml, opensAt, closesAt, placesLeft, capacity, price }}
        <li class="ticket">
          <div class="text">
            <h3>{name}</h3>
            <div class="description">{@html descriptionHtml}</div>
          </div>
          <div class="numbers">
            <span class="places">
              {#if placesLeft === -1}
                Illimité
              {:else}
                <span class="left">{placesLeft}</span><span class="capacity">{capacity}</span>
              {/if}
            </span>
          </div>
          <div class="book">
            {#if (!closesAt && !opensAt) || (closesAt && opensAt && isFuture(new Date(closesAt)) && isPast(new Date(opensAt)))}
              <ButtonSecondary href="./book/{uid}">{price}€</ButtonSecondary>
            {/if}
          </div>
          <p class="timing typo-details">
            {#if !opensAt && !closesAt}
              Shotgun intemporel
            {:else if opensAt && isFuture(new Date(opensAt))}
              Shotgun le {formatRelative(new Date(opensAt), new Date())}
            {:else if closesAt && isPast(new Date(closesAt))}
              En vente jusqu'à {formatRelative(new Date(closesAt), new Date())}
            {/if}
          </p>
        </li>
      {/each}
    </ul>
  </section>
{/if}
<section class="news">
  <h2>
    Actualités

    {#if $me?.admin || $me?.managedEvents.some(({ event, canEdit }) => event.id === id && canEdit)}
      <ButtonSecondary icon={IconPlus} href="./write">Article</ButtonSecondary>
    {/if}
  </h2>
  <ul class="nobullet">
    {#each articles as { uid, ...article } (uid)}
      <li>
        <CardArticle href="../../post/{uid}" {...article} />
      </li>
    {:else}
      <li class="empty muted">Aucun article pour le moment.</li>
    {/each}
  </ul>
</section>

<section class="organizer">
  <h2>Organisé par</h2>
  <div class="organizer-name-and-contact">
    <a class="organizer-name" href="/club/{group.uid}">
      <img
        src={group.pictureFile
          ? `${PUBLIC_STORAGE_URL}${group.pictureFile}`
          : 'https://via.placeholder.com/400/400'}
        alt=""
      />
      {group.name}
    </a>
    <ButtonSecondary href="malto:{contactMail}">Contact</ButtonSecondary>
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

  .ticket {
    display: grid;
    grid-template-areas: 'text numbers book' 'timing timing timing';
    grid-template-columns: 1fr max-content min-content;
    column-gap: 1rem;
    align-items: center;
    padding: 1rem;
    background: var(--muted-bg);
    border-radius: var(--radius-block);

    .text {
      grid-area: text;
      width: 100%;
    }

    .book {
      grid-area: book;
    }

    .numbers {
      display: flex;
      flex-direction: column;
      grid-area: numbers;
      align-items: end;
      width: 5rem;
    }

    .timing {
      grid-area: timing;
    }
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
