<script lang="ts">
  import ItemTicket from '$lib/components/ItemTicket.svelte';
  import { env } from '$env/dynamic/public';
  import IconPlus from '~icons/mdi/plus';
  import { me } from '$lib/session';
  import type { PageData } from './$types';
  import CardArticle from '$lib/components/CardArticle.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import Header from './Header.svelte';

  export let data: PageData;

  const { descriptionHtml, links, group, contactMail, articles, placesLeft, capacity } = data.event;

  const tickets = data.ticketsOfEvent;

  $: usersRegistration = tickets
    .flatMap((t) => t.registrations)
    .filter(({ beneficiary, author }) => author.uid === $me?.uid || beneficiary === $me?.uid);

  const bookingURL = (registrationId: string) =>
    `/bookings/${registrationId.split(':', 2)[1].toUpperCase()}`;
</script>

<Header {...data.event} />

{#if usersRegistration.length > 0}
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
{/if}

<section class="description">
  {#if links.length > 0}
    <ul class="links nobullet">
      {#each links as link}
        <li>
          <ButtonSecondary href={link.computedValue}>{link.name}</ButtonSecondary>
        </li>
      {/each}
    </ul>
  {/if}

  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html descriptionHtml}
</section>

{#if tickets.length > 0}
  <section class="tickets">
    <h2>
      Places <span class="places">
        {#if placesLeft === Number.POSITIVE_INFINITY}
          illimitées
        {:else}
          <span class="left">{placesLeft} restantes</span><span class="capacity">{capacity}</span>
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

    {#if $me?.admin || data.event.managers.some(({ user, canEdit }) => user.uid === $me?.uid && canEdit)}
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
          ? `${env.PUBLIC_STORAGE_URL}${group.pictureFile}`
          : 'https://via.placeholder.com/400/400'}
        alt=""
      />
      {group.name}
    </a>
    <ButtonSecondary href="mailto:{contactMail}">Contact</ButtonSecondary>
  </div>
</section>

<style lang="scss">
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

  ul.links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    margin-top: 1rem;
    margin-bottom: 3rem;
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
