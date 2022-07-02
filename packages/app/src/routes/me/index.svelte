<script context="module" lang="ts">
  import { session } from "$app/stores";
  import { formatDate } from "$lib/dates";
  import { redirectToLogin } from "$lib/session";
  import {
    CredentialType,
    mutate,
    Query,
    query,
    type PropsType,
  } from "$lib/zeus";
  import type { Load } from "@sveltejs/kit";
  import { default as parser } from "ua-parser-js";

  const propsQuery = () =>
    Query({
      me: {
        firstname: true,
        lastname: true,
        nickname: true,
        clubs: { club: { name: true }, title: true },
        credentials: {
          id: true,
          type: true,
          userAgent: true,
          createdAt: true,
          expiresAt: true,
          active: true,
        },
      },
    });

  type Props = PropsType<typeof propsQuery>;

  export const load: Load = async ({ fetch, session, url }) =>
    session.me
      ? {
          props: query(fetch, propsQuery(), { token: session.token }),
        }
      : redirectToLogin(url.pathname);
</script>

<script lang="ts">
  export let me: Props["me"];

  const deleteSession = async (id: string) => {
    await mutate({ deleteSession: [{ id }, true] }, { token: $session.token });
    me.credentials = me.credentials.filter(
      (credential) => credential.id !== id
    );
  };

  const humanizeUserAgent = (userAgent: string) => {
    const { browser, os } = parser(userAgent);
    if (!browser.name && !os.name) return userAgent;
    if (!os.name) return `${browser.name}`;
    return `${browser.name} sur ${os.name}`;
  };
</script>

<h1>
  {me.firstname}
  {#if me.nickname}<q>{me.nickname}</q>{/if}
  {me.lastname}
</h1>

<h2>Sessions</h2>
<table>
  <tr>
    <th>Session ouverte le</th>
    <th>Expire le</th>
    <th>Support</th>
    <th>Déconnecter</th>
  </tr>
  {#each me.credentials.filter(({ type }) => type === CredentialType.Token) as { id, createdAt, expiresAt, userAgent, active }}
    <tr>
      <td>{formatDate(createdAt)}</td>
      <td>{expiresAt ? formatDate(expiresAt) : "Jamais"}</td>
      <td>
        {#if active}
          <strong>Session actuelle</strong>
        {:else}
          {humanizeUserAgent(userAgent)}
        {/if}
      </td>
      <td><button on:click={() => deleteSession(id)}>❌</button></td>
    </tr>
  {/each}
</table>
