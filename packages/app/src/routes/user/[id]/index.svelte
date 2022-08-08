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
  // import SimpleIconsFacebook from '~icons/simple-icons/facebook';
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
  <p class="flex mt-2 text-xs text-gray-500 gap-2">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      width="2em"
      height="2em"
      viewBox="0 0 24 24"
      ><path
        fill="currentColor"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669c1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      /></svg
    >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      width="2em"
      height="2em"
      viewBox="0 0 24 24"
      ><path
        fill="currentColor"
        d="M12 0C8.74 0 8.333.015 7.053.072C5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053C.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913a5.885 5.885 0 0 0 1.384 2.126A5.868 5.868 0 0 0 4.14 23.37c.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558a5.898 5.898 0 0 0 2.126-1.384a5.86 5.86 0 0 0 1.384-2.126c.296-.765.499-1.636.558-2.913c.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913a5.89 5.89 0 0 0-1.384-2.126A5.847 5.847 0 0 0 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071c1.17.055 1.805.249 2.227.415c.562.217.96.477 1.382.896c.419.42.679.819.896 1.381c.164.422.36 1.057.413 2.227c.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227a3.81 3.81 0 0 1-.899 1.382a3.744 3.744 0 0 1-1.38.896c-.42.164-1.065.36-2.235.413c-1.274.057-1.649.07-4.859.07c-3.211 0-3.586-.015-4.859-.074c-1.171-.061-1.816-.256-2.236-.421a3.716 3.716 0 0 1-1.379-.899a3.644 3.644 0 0 1-.9-1.38c-.165-.42-.359-1.065-.42-2.235c-.045-1.26-.061-1.649-.061-4.844c0-3.196.016-3.586.061-4.861c.061-1.17.255-1.814.42-2.234c.21-.57.479-.96.9-1.381c.419-.419.81-.689 1.379-.898c.42-.166 1.051-.361 2.221-.421c1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324a6.162 6.162 0 1 0 0-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4s4 1.79 4 4s-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 0 1-2.88 0a1.44 1.44 0 0 1 2.88 0z"
      /></svg
    >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      width="2em"
      height="2em"
      viewBox="0 0 24 24"
      ><path
        fill="currentColor"
        d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472c-.18 1.898-.962 6.502-1.36 8.627c-.168.9-.499 1.201-.82 1.23c-.696.065-1.225-.46-1.9-.902c-1.056-.693-1.653-1.124-2.678-1.8c-1.185-.78-.417-1.21.258-1.91c.177-.184 3.247-2.977 3.307-3.23c.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345c-.48.33-.913.49-1.302.48c-.428-.008-1.252-.241-1.865-.44c-.752-.245-1.349-.374-1.297-.789c.027-.216.325-.437.893-.663c3.498-1.524 5.83-2.529 6.998-3.014c3.332-1.386 4.025-1.627 4.476-1.635z"
      /></svg
    >
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

  <h2 class="mb-1">Association Étudiante</h2>

  <ul class="pl-8">
    <li>
      <strong><a href={'#'}>AEn7</a></strong>
      <span class="rounded bg-emerald-500 text-xs p-1 text-zinc-50">BDA</span>
      Trésorière
    </li>
  </ul>

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
