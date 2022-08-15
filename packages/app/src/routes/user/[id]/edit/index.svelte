<script context="module" lang="ts">
  import { session } from '$app/stores';
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import Button from '$lib/components/buttons/Button.svelte';
  import GhostButton from '$lib/components/buttons/GhostButton.svelte';
  import InputGroup from '$lib/components/groups/InputGroup.svelte';
  import FileInput from '$lib/components/inputs/FileInput.svelte';
  import Loader from '$lib/components/loaders/Loader.svelte';
  import UserPicture from '$lib/components/pictures/UserPicture.svelte';
  import { $ as Zvar, mutate, query, Query, Selector, type PropsType } from '$lib/zeus';
  import MajesticonsChevronUp from '~icons/majesticons/chevron-up';
  import MajesticonsClose from '~icons/majesticons/close';
  import MajesticonsPlus from '~icons/majesticons/plus';
  import MajesticonsEdit from '~icons/majesticons/edit-pen-2-line';
  import type { Load } from './__types';

  const userQuery = Selector('User')({
    id: true,
    firstname: true,
    lastname: true,
    nickname: true,
    biography: true,
    pictureFile: true,
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

  let { id, nickname, biography, links, pictureFile } = user;
  let files: FileList;

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

  let updating = false;
  const updateUserPicture = async () => {
    if (updating) return;
    try {
      updating = true;
      const { updateUserPicture } = await mutate(
        { updateUserPicture: [{ id, file: Zvar('file', 'File!') }, true] },
        { token: $session.token, variables: { file: files[0] } }
      );
      pictureFile = updateUserPicture;
    } finally {
      updating = false;
    }
  };

  let deleting = false;
  const deleteUserPicture = async () => {
    if (deleting) return;
    try {
      deleting = true;
      await mutate({ deleteUserPicture: [{ id }, true] }, { token: $session.token });
      pictureFile = '';
    } finally {
      deleting = false;
    }
  };
</script>

<h1>Éditer <a href="..">{user.firstname} {user.nickname} {user.lastname}</a></h1>

<form on:submit|preventDefault>
  <fieldset>
    <legend>Photo de profil</legend>
    <FileInput bind:files on:change={updateUserPicture} accept="image/jpeg,image/png">
      <div class="relative">
        <div class="picture-edit">
          {#if updating}
            <Loader />
          {:else}
            <MajesticonsEdit />
          {/if}
        </div>
        <UserPicture
          src={pictureFile
            ? `${PUBLIC_STORAGE_URL}${pictureFile}`
            : 'https://via.placeholder.com/160'}
          alt="{user.firstname} {user.lastname}"
        />
      </div>
    </FileInput>
    {#if pictureFile}
      <p>
        <Button type="button" theme="danger" loading={deleting} on:click={deleteUserPicture}>
          Delete
        </Button>
      </p>
    {/if}
  </fieldset>
</form>

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
        <InputGroup>
          <select bind:value={link.type}>
            {#each linkTypes as type}
              <option>{type}</option>
            {/each}
          </select>
          <input bind:value={link.value} />
        </InputGroup>
        <InputGroup>
          <GhostButton
            title="Supprimer"
            on:click={() => {
              links = links.filter((_, j) => i !== j);
            }}
          >
            <MajesticonsClose aria-label="Supprimer" />
          </GhostButton>
          {#if i > 0}
            <GhostButton
              title="Supprimer"
              on:click={() => {
                links = [...links.slice(0, i - 1), links[i], links[i - 1], ...links.slice(i + 1)];
              }}
            >
              <MajesticonsChevronUp aria-label="Remonter" />
            </GhostButton>
          {/if}
        </InputGroup>
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

<style lang="scss">
  .picture-edit {
    --text: var(--bg);

    position: absolute;
    inset: 0;
    padding: 25%;
    color: var(--text);
    background: #0008;
    border-radius: var(--radius-inline);

    > :global(.icon) {
      width: 100%;
      height: 100%;
    }
  }
</style>
