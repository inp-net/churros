<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { PUBLIC_SUPPORT_EMAIL, PUBLIC_USER_DUMP_URL } from '$env/static/public';
  import { formatDateTime } from '$lib/dates';
  import { CredentialType, zeus } from '$lib/zeus';
  import { default as parser } from 'ua-parser-js';
  import type { PageData } from './$types';

  export let data: PageData;

  const deleteToken = async (id: string, active: boolean) => {
    if (active) {
      await goto(`/logout/?token=${$page.data.token!}`);
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
  {data.me.firstName}
  {#if data.me.nickname}<q>{data.me.nickname}</q>{/if}
  {data.me.lastName}
</h1>

<p>
  <a href="/user/{data.me.uid}/">Profil public</a> -
  <a href="/user/{data.me.uid}/edit/">Modifier</a>
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

<h2>Données personnelles</h2>
<p>
  <a href="{PUBLIC_USER_DUMP_URL}?token={data.token}" download="{data.me.uid}.json">
    Télécharger mes données.
  </a>
</p>
<p>
  Si vous souhaitez supprimer votre compte, merci de nous contacter via
  <a href="mailto:{PUBLIC_SUPPORT_EMAIL}">{PUBLIC_SUPPORT_EMAIL}</a>.
</p>
