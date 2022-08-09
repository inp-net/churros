<script context="module" lang="ts">
  import Card from '$lib/components/cards/Card.svelte';
  import SocialLink from '$lib/components/links/SocialLink.svelte';
  import { formatDate } from '$lib/dates.js';
  import { redirectToLogin } from '$lib/session';
  import { Query, query, type PropsType } from '$lib/zeus';
  import type { Load } from '@sveltejs/kit';
  import MajesticonsAcademicCapLine from '~icons/majesticons/academic-cap-line';
  import MajesticonsCakeLine from '~icons/majesticons/cake-line';
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
          firstname: true,
          graduationYear: true,
          lastname: true,
          pictureFile: true,
          birthday: true,
          phone: true,
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

<div class=" mt-2 text-center -mb-18">
  <img
    src="https://picsum.photos/120"
    alt="{user.firstname} {user.lastname}"
    class="rounded-1 shadow  shadow-gray-300"
    width="120"
    height="120"
  />
</div>
<Card>
  <h1 class="flex my-0 mt-14 gap-2 items-center">{user.firstname} {user.lastname}</h1>
  <p class="my-0 text-gray-500">
    {#if user.biography}
      {user.biography}
    {:else}
      {['👻', '🌵', '🕸️', '💤'][Number(user.id) % 4]}
    {/if}
  </p>
  {#if user.links.length > 0}
    <p class="flex mt-2 text-gray-500 gap-3">
      {#each user.links as link}
        <SocialLink {...link} />
      {/each}
    </p>
  {/if}

  <ul class="text-gray-700 cool">
    <li>
      <MajesticonsAcademicCapLine />
      {user.major.name}
      {user.graduationYear}
      {#each user.major.schools as { name }}
        <span class="rounded bg-blue-400 text-xs p-1 text-slate-50">{name}</span>
      {/each}
    </li>
    {#if user.birthday}
      <li>
        <MajesticonsCakeLine />
        {formatDate(user.birthday)}
      </li>
    {/if}
    {#if user.address}
      <li>
        <a href={'#'} class="text-inherit">
          <MajesticonsLocationMarkerLine />
          {user.address}
        </a>
      </li>
    {/if}
    {#if user.phone}
      <li>
        <a href="tel:{user.phone}" class="text-inherit">
          <MajesticonsPhoneLine />
          {user.phone}
        </a>
      </li>
    {/if}
  </ul>

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
  ul.cool {
    padding: 0;
    list-style: none;

    li {
      padding: 0.25rem 0;
    }

    li,
    li a {
      display: flex;
      gap: 0.5rem;
    }
  }

  .club {
    display: flex;
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
