<script context="module" lang="ts">
  import { formatDate } from '$lib/dates'
  import { query, Query, type PropsType } from '$lib/zeus'
  import type { Load } from './__types'

  const propsQuery = () =>
    Query({
      homepage: [
        {},
        {
          title: true,
          bodyHtml: true,
          publishedAt: true,
          club: { id: true, name: true },
          author: { id: true, firstname: true, lastname: true },
        },
      ],
    })

  type Props = PropsType<typeof propsQuery>

  export const load: Load = async ({ fetch, session }) => ({
    props: await query(fetch, propsQuery(), session),
  })
</script>

<script lang="ts">
  export let homepage: Props['homepage']
</script>

<h1>Welcome to Centraverse</h1>

{#each homepage as { title, bodyHtml, publishedAt, club, author }}
  <article>
    <h2>{title}</h2>
    <p>
      Par <a href="/club/{club.id}" sveltekit:prefetch>{club.name}</a> le {formatDate(publishedAt)}
    </p>
    {@html bodyHtml}
    {#if author}
      <p>
        <em>
          Auteur : <a href="/user/{author.id}" sveltekit:prefetch>
            {author.firstname}
            {author.lastname}
          </a>
        </em>
      </p>
    {/if}
  </article>
{/each}

<style>
  h1 {
    text-align: center;
  }
</style>
