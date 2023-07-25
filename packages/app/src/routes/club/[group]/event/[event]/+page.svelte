<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import Button from '$lib/components/Button.svelte';
  import { dateTimeFormatter } from '$lib/dates';
  import { me } from '$lib/session';
  import IconEdit from '~icons/mdi/pencil';
  import { isFuture, isPast } from 'date-fns';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import GhostButton from '$lib/components/ButtonGhost.svelte';
  import BackButton from '$lib/components/ButtonBack.svelte';

  export let data: PageData;

  const { id, tickets, title, startsAt, pictureFile, descriptionHtml, links, group, contactMail } =
    data.event;

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

<section
  class="header"
  style:background-image="linear-gradient(#000000aa, #000000aa), url({pictureFile
    ? `${PUBLIC_STORAGE_URL}${pictureFile}`
    : 'https://picsum.photos/400/400'})"
>
  <h1>
    <BackButton go="../.." white />
    {title}

    {#if $me?.admin || $me?.managedEvents.some(({ event, canEdit }) => event.id === id && canEdit)}
      <GhostButton darkShadow on:click={async () => goto(`./edit`)}
        ><IconEdit color="white" /></GhostButton
      >
    {/if}
  </h1>
  <p>{dateTimeFormatter.format(startsAt)}</p>
</section>
{#each usersRegistration as { ticket, beneficiary, author, authorIsBeneficiary, beneficiaryUser, id }}
  <Button theme="primary" on:click={async () => goto(bookingURL(id))}
    >{#if authorIsBeneficiary || author.uid !== $me?.uid}Ma place{:else}Place pour {#if beneficiaryUser}{beneficiaryUser.firstName}
        {beneficiaryUser.lastName}{:else}{beneficiary}{/if}{/if}
    <span class="ticket-name">{ticket.name}</span></Button
  >
{/each}

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

<section class="tickets">
  <h2>
    Places <span class="places">
      {#if eventPlacesLeft < 0}
        illimitées
      {:else}
        <span class="left">{eventPlacesLeft}</span><span class="capacity">{eventCapacity}</span>
      {/if}
    </span>
  </h2>

  <ul>
    {#each tickets as { name, uid, descriptionHtml, opensAt, closesAt, placesLeft, capacity, price }}
      <li class="ticket">
        <div class="text">
          <h3>{name}</h3>
          <div class="description">{@html descriptionHtml}</div>
          {#if !opensAt || !closesAt}
            <p>Mise en vente sans limite de date</p>
          {:else if isFuture(new Date(opensAt))}
            <p>Mise en vente le {dateTimeFormatter.format(opensAt)}</p>
          {:else}
            <p>Mise en vente jusqu'au {dateTimeFormatter.format(closesAt)}</p>
          {/if}
        </div>
        <div class="numbers">
          <p class="price">
            {#if price > 0}
              {price}€
            {:else}
              Gratos
            {/if}
          </p>
          <span class="places">
            {#if placesLeft === -1}
              Illimité
            {:else}
              <span class="left">{placesLeft}</span>
              <span class="capacity">{capacity}</span>
            {/if}
          </span>
        </div>
        <div class="book">
          {#if (!closesAt && !opensAt) || (closesAt && opensAt && isFuture(new Date(closesAt)) && isPast(new Date(opensAt)))}
            <Button
              on:click={async () => {
                await goto(`./book/${uid}`);
              }}>Réserver</Button
            >
          {/if}
        </div>
      </li>
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
    <a href="malto:{contactMail}"> Contact </a>
  </div>
</section>

<style lang="scss">
  .header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background-size: cover;

    > * {
      margin: 0;
      color: white;
    }
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

  .places {
    display: inline-block;
  }

  .ticket .places .left::after {
    width: 1px;
  }

  .ticket {
    display: flex;
    gap: 1rem;
    align-items: center;

    .text {
      width: 100%;
    }

    .numbers {
      display: flex;
      flex-direction: column;
      align-items: end;
      width: 5rem;
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
    }
  }
</style>
