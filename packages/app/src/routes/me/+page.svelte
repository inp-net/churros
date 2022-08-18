<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { formatDateTime } from '$lib/dates';
  import { CredentialType, zeus } from '$lib/zeus';
  import { default as parser } from 'ua-parser-js';
  import type { PageData } from './$types';

  export let data: PageData;

  const deleteToken = async (id: string, active: boolean) => {
    if (active) {
      await goto(`/logout?token=${$page.data.token as string}`);
    } else {
      await $zeus.mutate({ deleteToken: [{ id }, true] });
      data.me.credentials = data.me.credentials.filter((credential) => credential.id !== id);
    }
  };

  const humanizeUserAgent = (userAgent: string) => {
    const { browser, os } = parser(userAgent);
    if (!browser.name) return userAgent;
    if (!os.name) return `${browser.name}`;
    return `${browser.name} sur ${os.name}`;
  };
</script>

<h1>
  {data.me.firstname}
  {#if data.me.nickname}<q>{data.me.nickname}</q>{/if}
  {data.me.lastname}
</h1>

<p>
  <a href="/user/{data.me.id}/" sveltekit:prefetch>Profil public</a> -
  <a href="/user/{data.me.id}/edit/" sveltekit:prefetch>Modifier</a>
</p>

<h2>Sessions</h2>
<table>
  <tr>
    <th>Session ouverte le</th>
    <th>Support</th>
    <th>Déconnecter</th>
  </tr>
  {#each data.me.credentials.filter(({ type }) => type === CredentialType.Token) as { id, createdAt, userAgent, active }}
    <tr>
      <td>{formatDateTime(createdAt)}</td>
      <td>
        {#if active}
          Session actuelle
        {:else}
          {humanizeUserAgent(userAgent)}
        {/if}
      </td>
      <td><button on:click={async () => deleteToken(id, active)}>❌</button></td>
    </tr>
  {/each}
</table>
