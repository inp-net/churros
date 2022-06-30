<script context="module" lang="ts">
  import { session } from "$app/stores";
  import { redirectToLogin } from "$lib/session";
  import {
    CredentialType,
    mutate,
    Query,
    query,
    type PropsType,
  } from "$lib/zeus";
  import type { Load } from "@sveltejs/kit";

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
          createdAt: true,
          expiresAt: true,
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
  </tr>
  {#each me.credentials.filter(({ type }) => type === CredentialType.Token) as { id, createdAt, expiresAt }}
    <tr>
      <td>{createdAt}</td>
      <td>{expiresAt ?? "Jamais"}</td>
      <td><button on:click={() => deleteSession(id)}>❌</button></td>
    </tr>
  {/each}
</table>
