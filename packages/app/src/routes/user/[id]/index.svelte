<script context="module" lang="ts">
  import Card from '$lib/components/cards/Card.svelte';
  import SocialLink from '$lib/components/links/SocialLink.svelte';
  import FlexList from '$lib/components/lists/FlexList.svelte';
  import { formatDate } from '$lib/dates.js';
  import { redirectToLogin } from '$lib/session';
  import { Query, query, type PropsType } from '$lib/zeus';
  import type { Load } from '@sveltejs/kit';
  import MajesticonsAcademicCapLine from '~icons/majesticons/academic-cap-line';
  import MajesticonsCakeLine from '~icons/majesticons/cake-line';
  import MajesticonsEditPen from '~icons/majesticons/edit-pen-2';
  import MajesticonsLocationMarkerLine from '~icons/majesticons/location-marker-line';
  import MajesticonsPhoneLine from '~icons/majesticons/phone-line';

  const propsQuery = (id: string) =>
    Query({
      user: [
        { id },
        {
          id: true,
          address: true,
          biography: true,
          birthday: true,
          firstname: true,
          graduationYear: true,
          lastname: true,
          nickname: true,
          phone: true,
          pictureFile: true,
          clubs: { club: { id: true, name: true }, title: true },
          links: { type: true, value: true },
          major: { name: true, schools: { name: true } },
        },
      ],
    });

  type Props = PropsType<typeof propsQuery>;

  export const load: Load = async ({ fetch, params, session, url }) =>
    session.me
      ? { props: await query(fetch, propsQuery(params.id), session) }
      : redirectToLogin(url.pathname);
</script>

<script lang="ts">
  export let user: Props['user'];
</script>

<div class="placeholder" />

<Card>
  <div class="user-header">
    <img
      src="https://picsum.photos/160"
      alt="{user.firstname} {user.lastname}"
      class="user-picture"
      width="160"
      height="160"
    />
    <div class="user-title">
      <h1 class="my-0">
        {user.firstname}
        {user.nickname}
        {user.lastname}
        <a href="edit/" title="Éditer" sveltekit:prefetch>
          <MajesticonsEditPen aria-label="Éditer" />
        </a>
      </h1>
      <div class="biography">
        {#if user.biography}
          {user.biography}
        {:else}
          {['👻', '🌵', '🕸️', '💤'][Number(user.id) % 4]}
        {/if}
      </div>
      {#if user.links.length > 0}
        <div class="flex mt-2 gap-3">
          {#each user.links as link}
            <SocialLink {...link} />
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <FlexList>
    <li>
      <MajesticonsAcademicCapLine aria-label="Filière" />
      {user.major.name}
      {user.graduationYear}
      {#each user.major.schools as { name }}
        <span class="rounded bg-blue-400 text-xs p-1 text-slate-50">{name}</span>
      {/each}
    </li>
    {#if user.birthday}
      <li>
        <MajesticonsCakeLine aria-label="Anniversaire" />
        {formatDate(user.birthday)}
      </li>
    {/if}
    {#if user.address}
      <li>
        <a
          href="https://www.google.com/maps/search/?api=1&{new URLSearchParams({
            query: user.address,
          })}"
          target="maps"
        >
          <MajesticonsLocationMarkerLine aria-label="Adresse" />
          {user.address}
        </a>
      </li>
    {/if}
    {#if user.phone}
      <li>
        <a href="tel:{user.phone}">
          <MajesticonsPhoneLine aria-label="Téléphone" />
          {user.phone}
        </a>
      </li>
    {/if}
  </FlexList>

  <div class="grid grid-cols-2">
    <div>
      <h2 class="mb-1">Association Étudiante</h2>

      <ul class="pl-8">
        <li>
          <strong><a href={'#'}>AEn7</a></strong>
          <span class="rounded bg-emerald-500 text-xs p-1 text-zinc-50">BDA</span>
          Trésorière
        </li>
      </ul>
    </div>
    <div>
      <h2 class="mb-1">Clubs</h2>
      <ul class="mt-1 cool">
        {#each user.clubs as { club, title }}
          <li>
            <a
              href="/club/{club.id}/"
              class="text-inherit club no-underline !gap-0"
              style:--bg="#38bdf880"
              sveltekit:prefetch
            >
              <span>{club.name}</span>
              <span>{title}</span>
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</Card>

<style lang="scss">
  .placeholder {
    height: 5rem;
  }

  .user-header {
    margin-top: 5rem;
    margin-bottom: 1rem;
  }

  .user-picture {
    position: absolute;
    border-radius: var(--radius-block);
    border-radius: var(--radius-inline);
    box-shadow: var(--shadow);
    transform: translateY(-100%);
  }

  .user-title {
    flex: 1;
    padding-block: 0.5rem;
  }

  .biography {
    color: var(--muted);
  }

  @media (min-width: $breakpoint-mobile) {
    .placeholder {
      height: 0;
    }

    .user-header {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-top: 1rem;
    }

    .user-picture {
      position: static;
      transform: none;
    }

    .user-title {
      padding-block: 0;
    }
  }

  .club {
    display: inline-flex;
    overflow: hidden;
    background: var(--bg);
    border-radius: var(--radius-inline);

    :first-child {
      padding: 0.25rem 0.25rem 0.25rem 0.5rem;
      background: var(--bg);
    }

    :last-child {
      padding: 0.25rem 0.5rem 0.25rem 0.25rem;
    }
  }
</style>
