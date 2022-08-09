<script context="module" lang="ts">
  import { redirectToLogin } from '$lib/session';
  import { Query, query, type PropsType } from '$lib/zeus';
  import type { Load } from '@sveltejs/kit';

  const propsQuery = (id: string) =>
    Query({
      user: [
        { id },
        {
          id: true,
          firstname: true,
          lastname: true,
          pictureFile: true,
          clubs: { club: { id: true, name: true }, title: true },
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
  import Card from '$lib/components/cards/Card.svelte';
  import MajesticonsAcademicCapLine from '~icons/majesticons/academic-cap-line';
  import MajesticonsCakeLine from '~icons/majesticons/cake-line';
  import MajesticonsLocationMarkerLine from '~icons/majesticons/location-marker-line';
  import SimpleIconsFacebook from '~icons/simple-icons/facebook';
  import SimpleIconsInstagram from '~icons/simple-icons/instagram';
  import SimpleIconsTelegram from '~icons/simple-icons/telegram';
</script>

<div class=" mt-2 text-center -mb-18">
  <img
    src="http://picsum.photos/120"
    alt="{user.firstname} {user.lastname}"
    class="rounded-1 shadow  shadow-gray-300"
    width="120"
    height="120"
  />
</div>
<Card>
  <h1 class="flex my-0 mt-14 gap-2 items-center">{user.firstname} {user.lastname}</h1>
  <p class="my-0 text-gray-500">
    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officia ipsum accusamus enim.
  </p>
  <p class="flex mt-2 text-gray-500 gap-3">
    <SimpleIconsFacebook width="2em" height="2em" />
    <SimpleIconsInstagram width="2em" height="2em" />
    <SimpleIconsTelegram width="2em" height="2em" />
  </p>

  <ul class="text-gray-700 cool">
    <li>
      <MajesticonsAcademicCapLine />
      {user.major.name}
      {#each user.major.schools as { name }}
        <span class="rounded bg-blue-400 text-xs p-1 text-slate-50">{name}</span>
      {/each}
    </li>
    <li>
      <MajesticonsCakeLine /> 1er avril 2000
    </li>
    <li>
      <a href={'#'} class="text-inherit">
        <MajesticonsLocationMarkerLine />
        123 Avenue des Champs-Élysées
      </a>
    </li>
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
