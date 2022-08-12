<script context="module" lang="ts">
  import { session } from '$app/stores';
  import Button from '$lib/components/buttons/Button.svelte';
  import { $ as Zvar, mutate, query, Query, Selector, type PropsType } from '$lib/zeus';
  import type { Load } from './__types';
  import MajesticonsClose from '~icons/majesticons/close';
  import MajesticonsPlus from '~icons/majesticons/plus';
  import MajesticonsChevronUp from '~icons/majesticons/chevron-up';

  const userQuery = Selector('User')({
    id: true,
    firstname: true,
    lastname: true,
    nickname: true,
    biography: true,
    links: { type: true, value: true },
  });
  const propsQuery = (id: string) => Query({ user: [{ id }, userQuery], linkTypes: true });

  type Props = PropsType<typeof propsQuery>;

  export const load: Load = async ({ fetch, params, session }) =>
    params.id === session.me?.id || session.me?.canEditUsers
      ? { props: await query(fetch, propsQuery(params.id), session) }
      : { status: 307, redirect: '..' };
</script>

<script lang="ts">
  export let user: Props['user'];
  export let linkTypes: Props['linkTypes'];

  let { id, nickname, biography, links } = user;
  let files: FileList;
  let userPicture: string | undefined;

  let loading = false;
  const updateUser = async () => {
    if (loading) return;
    try {
      loading = true;
      const { updateUser } = await mutate(
        { updateUser: [{ id, nickname, biography, links }, userQuery] },
        $session
      );
      user = updateUser;
    } finally {
      loading = false;
    }
  };

  const updateUserPicture = async () => {
    const { updateUserPicture } = await mutate(
      {
        updateUserPicture: [{ id, file: Zvar('file', 'File!') }, true],
      },
      { token: $session.token, variables: { file: files[0] } }
    );
    userPicture = updateUserPicture;
  };
</script>

<h1>Éditer <a href="..">{user.firstname} {user.nickname} {user.lastname}</a></h1>

{#if userPicture}
  <img src="http://localhost:4000/storage/{userPicture}" alt="{user.firstname} {user.lastname}" />
{/if}

<form on:submit|preventDefault={updateUser}>
  <p>
    <label>Surnom : <input type="text" bind:value={nickname} /></label>
  </p>
  <p>
    <label>Description : <input type="text" bind:value={biography} /></label>
  </p>
  <p>Réseaux sociaux :</p>
  <ul>
    {#each links as link, i}
      <li>
        <select bind:value={link.type}>
          {#each linkTypes as type}
            <option>{type}</option>
          {/each}
        </select>
        <input bind:value={link.value} />
        <button
          type="button"
          title="Supprimer"
          on:click={() => {
            links = links.filter((_, j) => i !== j);
          }}
        >
          <MajesticonsClose aria-label="Supprimer" />
        </button>
        {#if i > 0}
          <button
            type="button"
            title="Supprimer"
            on:click={() => {
              links = [...links.slice(0, i - 1), links[i], links[i - 1], ...links.slice(i + 1)];
            }}
          >
            <MajesticonsChevronUp aria-label="Remonter" />
          </button>
        {/if}
      </li>
    {/each}
    <li>
      <button
        type="button"
        on:click={() => {
          links = [...links, { type: linkTypes[0], value: '' }];
        }}><MajesticonsPlus aria-hidden="true" />Ajouter</button
      >
    </li>
  </ul>
  <p>
    <Button type="submit" theme="primary" {loading}>Sauvegarder</Button>
  </p>
</form>

<h2>Photo de profil</h2>

<input type="file" bind:files on:change={updateUserPicture} />
