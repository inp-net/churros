<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import fr from 'date-fns/locale/fr/index.js';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import IconGear from '~icons/mdi/gear-outline';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { dateTimeFormatter, formatDateTime } from '$lib/dates';
  import { me } from '$lib/session';
  import type { PageData } from './$types';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import { formatRelative, isFuture, isWithinInterval } from 'date-fns';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';

  export let data: PageData;
  const { author, publishedAt, links, title, bodyHtml, group, pictureFile, event } = data.article;
  $: canEditArticles =
    $me?.admin ||
    $me?.groups.some(({ group: { uid }, canEditArticles }) => uid === group.uid && canEditArticles);

  $: usersRegistration = event?.tickets
    .flatMap((t) => t.registrations)
    .filter(({ beneficiary, author }) => author.uid === $me?.uid || beneficiary === $me?.uid);

  const bookingURL = (registrationId: string) =>
    `/bookings/${registrationId.split(':', 2)[1].toUpperCase()}`;
</script>

{#if pictureFile}
  <img src="{PUBLIC_STORAGE_URL}{pictureFile}" alt="" />
{/if}

<div class="content">
  <header>
    <h1>
      <ButtonBack />
      {title}
      <ButtonShare />
      {#if canEditArticles}
        <ButtonGhost href="./edit"><IconGear /></ButtonGhost>
      {/if}
    </h1>
    <p class="published-at">
      Publié le {dateTimeFormatter.format(publishedAt)} par
      <a href="/club/{group.uid}">{group.name}</a>
    </p>
  </header>

  <section class="body">{@html bodyHtml}</section>

  {#if links.length > 0}
    <ul class="links nobullet">
      {#each links as link}
        <li>
          <ButtonSecondary href={link.computedValue}>{link.name}</ButtonSecondary>
        </li>
      {/each}
    </ul>
  {/if}

  {#if author}
    <section class="author">
      <AvatarPerson
        {...author}
        href="/user/{author.uid}"
        role={author.groups.find((g) => g.group.uid === group.uid)?.title ?? ''}
      />
    </section>
  {/if}

  {#if event}
    <section class="event">
      <h2>
        Évènement {#if canEditArticles}
          <ButtonSecondary href="../../event/{event.uid}/edit">Modifier</ButtonSecondary>{/if}
      </h2>

      <p>
        {formatDateTime(event.startsAt)} · {formatRelative(event.startsAt, new Date(), {
          locale: fr,
          weekStartsOn: 1,
        })}
      </p>
      {#each usersRegistration ?? [] as { ticket, beneficiary, author, authorIsBeneficiary, beneficiaryUser, id }}
        <ButtonPrimary href={bookingURL(id)}
          >{#if authorIsBeneficiary || author.uid !== $me?.uid}Ma place{:else}Place pour {#if beneficiaryUser}{beneficiaryUser.firstName}
              {beneficiaryUser.lastName}{:else}{beneficiary}{/if}{/if}
          <span class="ticket-name">{ticket.name}</span></ButtonPrimary
        >
      {/each}
      <ul>
        {#each event.tickets as { name, uid, descriptionHtml, opensAt, closesAt, placesLeft, capacity, price }}
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
              {#if (!closesAt && !opensAt) || (closesAt && opensAt && isWithinInterval( new Date(), { end: new Date(closesAt), start: new Date(opensAt) } ))}
                <ButtonSecondary href="./book/${uid}">Réserver</ButtonSecondary>
              {/if}
            </div>
          </li>
        {/each}
      </ul>
    </section>
    <section class="organizer">
      <h2>Organisé par</h2>
      <div class="organizer-name-and-contact">
        <a class="organizer-name" href="/club/{event.group.uid}">
          <img
            src={event.group.pictureFile
              ? `${PUBLIC_STORAGE_URL}${event.group.pictureFile}`
              : 'https://via.placeholder.com/400/400'}
            alt=""
          />
          {event.group.name}
        </a>
        <ButtonSecondary href="malto:{event.contactMail}">Contact</ButtonSecondary>
      </div>
    </section>
  {/if}
</div>

<style lang="scss">
  .content {
    display: flex;
    flex-flow: column wrap;
    gap: 2rem;
    max-width: 1000px;
    margin: 0 auto;
  }

  h1 {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
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
</style>
