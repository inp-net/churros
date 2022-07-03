<script context="module" lang="ts">
  import { redirectToLogin } from "$lib/session";
  import { Query, query, type PropsType } from "$lib/zeus";
  import type { Load } from "@sveltejs/kit";

  const propsQuery = (id: string) =>
    Query({
      user: [
        { id },
        {
          firstname: true,
          lastname: true,
          clubs: { club: { id: true, name: true }, title: true },
        },
      ],
    });

  type Props = PropsType<typeof propsQuery>;

  export const load: Load = async ({ fetch, params, session, url }) =>
    session.me
      ? {
          props: await query(fetch, propsQuery(params.id), {
            token: session.token,
          }),
        }
      : redirectToLogin(url.pathname);
</script>

<script lang="ts">
  export let user: Props["user"];
</script>

<h1>{user.firstname} {user.lastname}</h1>

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
