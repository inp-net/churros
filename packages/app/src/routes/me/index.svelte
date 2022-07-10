<script context="module" lang="ts">
  import { goto } from '$app/navigation'
  import { session } from '$app/stores'
  import { formatDate } from '$lib/dates'
  import { redirectToLogin } from '$lib/session'
  import { CredentialType, mutate, Query, query, type PropsType } from '$lib/zeus'
  import type { Load } from './__types'
  import { default as parser } from 'ua-parser-js'

  const propsQuery = () =>
    Query({
      me: {
        id: true,
        firstname: true,
        lastname: true,
        nickname: true,
        clubs: { club: { id: true, name: true }, title: true },
        credentials: {
          id: true,
          type: true,
          userAgent: true,
          createdAt: true,
          active: true,
        },
      },
    })

  type Props = PropsType<typeof propsQuery>

  export const load: Load = async ({ fetch, session, url }) =>
    session.me
      ? { props: await query(fetch, propsQuery(), session) }
      : redirectToLogin(url.pathname)
</script>

<script lang="ts">
  export let me: Props['me']

  const deleteSession = async (id: string, active: boolean) => {
    if (active) {
      await goto(`/logout?token=${$session.token!}`)
    } else {
      await mutate({ deleteSession: [{ id }, true] }, $session)
      me.credentials = me.credentials.filter((credential) => credential.id !== id)
    }
  }

  const humanizeUserAgent = (userAgent: string) => {
    const { browser, os } = parser(userAgent)
    if (!browser.name) return userAgent
    if (!os.name) return `${browser.name}`
    return `${browser.name} sur ${os.name}`
  }
</script>

<h1>
  {me.firstname}
  {#if me.nickname}<q>{me.nickname}</q>{/if}
  {me.lastname}
</h1>

<p>
  <a href="/user/{me.id}/" sveltekit:prefetch>Profil public</a> -
  <a href="/user/{me.id}/edit/" sveltekit:prefetch>Modifier</a>
</p>

<h2>Clubs</h2>

{#if me.clubs.length > 0}
  <ul>
    {#each me.clubs as { club, title }}
      <li>
        {title} de <a href="/club/{club.id}" sveltekit:prefetch>{club.name}</a>
      </li>
    {/each}
  </ul>
{:else}
  <p>Aucun club</p>
{/if}

<h2>Sessions</h2>
<table>
  <tr>
    <th>Session ouverte le</th>
    <th>Support</th>
    <th>Déconnecter</th>
  </tr>
  {#each me.credentials.filter(({ type }) => type === CredentialType.Token) as { id, createdAt, userAgent, active }}
    <tr>
      <td>{formatDate(createdAt)}</td>
      <td>
        {#if active}
          Session actuelle
        {:else}
          {humanizeUserAgent(userAgent)}
        {/if}
      </td>
      <td><button on:click={async () => deleteSession(id, active)}>❌</button></td>
    </tr>
  {/each}
</table>
