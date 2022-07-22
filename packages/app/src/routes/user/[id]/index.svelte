<script context="module" lang="ts">
  import { redirectToLogin } from '$lib/session';
  import { Query, query, type PropsType } from '$lib/zeus';
  import type { Load } from '@sveltejs/kit';
  import { session } from '$app/stores';

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
</script>

{#if user.pictureFile}
  <img
    src="http://localhost:4000/storage/{user.pictureFile}"
    alt="{user.firstname} {user.lastname}"
    width="100"
  />
{/if}

<h1>{user.firstname} {user.lastname}</h1>

<p>{user.major.name} ({user.major.schools.map(({ name }) => name).join(', ')})</p>

{#if $session.me?.canEditUsers || user.id === $session.me?.id}
  <p><a href="./edit" sveltekit:prefetch>Modifier</a></p>
{/if}

<h2>Clubs</h2>

{#if user.clubs.length > 0}
  <ul>
    {#each user.clubs as { club, title }}
      <li>
        {title} de <a href="/club/{club.id}" sveltekit:prefetch>{club.name}</a>
      </li>
    {/each}
  </ul>
{:else}
  <p>Aucun club</p>
{/if}
