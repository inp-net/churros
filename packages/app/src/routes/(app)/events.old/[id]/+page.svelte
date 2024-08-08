<script lang="ts">
  import ItemTicket from '$lib/components/ItemTicket.svelte';
  import IconPlus from '~icons/mdi/plus';
  import { me } from '$lib/session';
  import type { PageData } from './$types';
  import CardArticle from '$lib/components/CardArticle.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import Header from './Header.svelte';
  import { groupLogoSrc } from '$lib/logos';
  import { isDark } from '$lib/theme';
  import AreaReactions from './AreaReactions.svelte';
  import { calendarLinks } from '$lib/calendars';
  import IconGoogleCalendar from '~icons/logos/google-calendar';
  import IconCalendar from '~icons/mdi/calendar-export-outline';
  import { onMount } from 'svelte';
  import { toasts } from '$lib/toasts';
  import { subscribe } from '$lib/subscriptions';
  import { page } from '$app/stores';
  import IconForm from '~icons/mdi/form-select';
  import { route } from '$lib/ROUTES';

  export let data: PageData;

  const event = data.event!;

  let {
    descriptionHtml,
    links,
    group,
    coOrganizers,
    contactMail,
    articles,
    capacity,
    reactionCounts,
    myReactions,
    forms,
    placesLeft,
    tickets,
  } = event;

  /**
   * List of ticket IDs that received new data from the websocket connection
   */
  let updatedTicketsIds: string[] = [];

  onMount(() => {
    $subscribe(
      {
        event: [
          { id: $page.params.id },
          { placesLeft: true, tickets: { placesLeft: true, id: true } },
        ],
      },
      async (eventData) => {
        const freshData = await eventData;
        if ('errors' in freshData) return;
        if (!freshData.event) return;
        placesLeft = freshData.event.placesLeft as unknown as number | null;
        // @ts-expect-error zeus est con
        tickets = data.event.tickets.map((t) => {
          const freshTicket = freshData.event?.tickets.find((t2) => t2?.id === t.id);
          if ((freshTicket?.placesLeft as unknown as number | null) !== t.placesLeft)
            updatedTicketsIds.push(t.id);
          return { ...t, ...freshTicket };
        });
        setTimeout(() => {
          updatedTicketsIds = [];
        }, 500);
      },
    );
  });

  function notUndefined<T>(x: T | undefined): x is T {
    return x !== undefined;
  }

  $: usersRegistration = tickets
    .flatMap((t) => t.registrations?.filter(notUndefined) ?? [])
    .filter(({ beneficiary, author }) => author?.uid === $me?.uid || beneficiary === $me?.uid);

  const bookingURL = (registrationId: string) =>
    `/bookings/${registrationId.split(':', 2)[1].toUpperCase()}`;

  const calendarURLs = calendarLinks(event);

  onMount(() => {
    if (data.claimedCode) toasts.success('Ton code de réduction a bien été appliqué ;)');
    else if (data.claimCodeError) toasts.error(data.claimCodeError);
  });
</script>

<Header {...event} />

{#if usersRegistration.length > 0}
  <ul class="nobullet bookings">
    {#each usersRegistration as { ticket, beneficiary, author, authorIsBeneficiary, beneficiaryUser, id, opposed, cancelled }}
      {#if !opposed && !cancelled}
        <li>
          <ButtonPrimary href={bookingURL(id)}
            >{#if authorIsBeneficiary || author?.uid !== $me?.uid}Ma place{:else}Place pour {#if beneficiaryUser}{beneficiaryUser.firstName}
                {beneficiaryUser.lastName}{:else}{beneficiary}{/if}{/if}
            <span class="ticket-name">{ticket.name}</span></ButtonPrimary
          >
        </li>
      {/if}
    {/each}
  </ul>
{/if}

<section class="description user-html">
  {#if links.length + forms.length > 0}
    <ul class="links nobullet">
      {#each forms as form}
        <li>
          <ButtonSecondary icon={IconForm} href="/forms/{form.localId}/answer"
            >{form.title}</ButtonSecondary
          >
        </li>
      {/each}
      {#each links as link}
        <li>
          <ButtonSecondary href={link.computedValue}>{link.name}</ButtonSecondary>
        </li>
      {/each}
    </ul>
  {/if}

  <div data-user-html>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html descriptionHtml}
  </div>
</section>

<section class="reactions">
  <AreaReactions bind:myReactions bind:reactionCounts connection={{ eventId: event.id }} />
</section>

{#if tickets.length > 0}
  <section class="tickets">
    <h2>
      Places {#if placesLeft !== undefined && placesLeft !== null}<span class="places">
          {#if placesLeft === Number.POSITIVE_INFINITY || capacity === 0}
            Illimitées
          {:else}
            <span class="left">{placesLeft} restante{placesLeft > 1 ? 's' : ''}</span><span
              class="capacity">{capacity}</span
            >
          {/if}
        </span>{/if}
    </h2>

    <ul class="nobullet">
      {#each tickets.sort( (a, b) => (a.group?.name ?? '').localeCompare(b.group?.name ?? ''), ) as { id, ...ticket } (id)}
        <li>
          <ItemTicket {...ticket} {event} />
        </li>
      {/each}
    </ul>
  </section>
{/if}

<section class="add-to-calendar">
  <h2>Ajouter à mon calendrier</h2>
  <ul class="nobullet options">
    <li>
      <ButtonSecondary icon={IconGoogleCalendar} newTab href={calendarURLs.google}
        >Google Agenda</ButtonSecondary
      >
    </li>
    <li>
      <ButtonSecondary icon={IconCalendar} newTab href={calendarURLs.ical}>Autres</ButtonSecondary>
    </li>
  </ul>
</section>

<section class="news">
  <h2>
    Actualités

    {#if $me?.admin || event.managers.some(({ user, canEdit }) => user.uid === $me?.uid && canEdit)}
      <ButtonSecondary icon={IconPlus} href="./write">Post</ButtonSecondary>
    {/if}
  </h2>
  <ul class="nobullet">
    {#each articles as { localID, reactionCounts, myReactions, ...article } (localID)}
      <li>
        <CardArticle
          likes={reactionCounts['❤️']}
          liked={myReactions['❤️']}
          href={route('/posts/[id]', localID)}
          {...article}
        />
      </li>
    {:else}
      <li class="empty muted">Aucun post pour le moment.</li>
    {/each}
  </ul>
</section>

<section class="organizer">
  <h2>
    Organisé par
    <ButtonSecondary href="mailto:{contactMail}">Contacter l'orga</ButtonSecondary>
  </h2>
  <ul class="nobullet organizers">
    {#each [group, ...coOrganizers] as g}
      <li class="organizer-name-and-contact">
        <a class="organizer-name" href="/groups/{g.uid}">
          <img src={groupLogoSrc($isDark, g)} alt="" />
          {g.name}
        </a>
      </li>
    {/each}
  </ul>
</section>

<style lang="scss">
  section {
    max-width: 1000px;
    padding: 0 1rem;
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

  .add-to-calendar .options {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: center;
  }

  .organizers {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem 2rem;
    margin-top: 0.5rem;
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
