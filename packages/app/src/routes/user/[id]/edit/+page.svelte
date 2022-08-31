<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import Button from '$lib/components/buttons/Button.svelte';
  import GhostButton from '$lib/components/buttons/GhostButton.svelte';
  import InputGroup from '$lib/components/groups/InputGroup.svelte';
  import FileInput from '$lib/components/inputs/FileInput.svelte';
  import Loader from '$lib/components/loaders/Loader.svelte';
  import UserPicture from '$lib/components/pictures/UserPicture.svelte';
  import { $ as Zvar, zeus } from '$lib/zeus';
  import MajesticonsChevronUp from '~icons/majesticons/chevron-up';
  import MajesticonsClose from '~icons/majesticons/close';
  import MajesticonsEdit from '~icons/majesticons/edit-pen-2-line';
  import MajesticonsPlus from '~icons/majesticons/plus';
  import type { PageData } from './$types';
  import { userQuery } from './+page';

  export let data: PageData;

  // We don't want form bindings to be reactive to let them evolve separately from the data
  let {
    address,
    biography,
    graduationYear,
    links,
    majorId,
    nickname,
    phone,
    pictureFile,
    birthday,
  } = data.user;

  let files: FileList;

  const asDate = (x: unknown) => new Date(x as Date);
  const asInput = (x: unknown) => x as HTMLInputElement;

  let loading = false;
  const updateUser = async () => {
    if (loading) return;
    try {
      loading = true;
      const { updateUser } = await $zeus.mutate({
        updateUser: [
          {
            id: data.user.id,
            nickname,
            biography,
            links,
            address,
            graduationYear,
            majorId,
            phone,
            birthday,
          },
          {
            __typename: true,
            '...on Error': { message: true },
            '...on MutationUpdateUserSuccess': { data: userQuery },
          },
        ],
      });

      if (updateUser.__typename === 'Error') {
        console.error(updateUser.message);
        return;
      }

      data.user = updateUser.data;
    } finally {
      loading = false;
    }
  };

  let updating = false;
  const updateUserPicture = async () => {
    if (updating) return;
    try {
      updating = true;
      const { updateUserPicture } = await $zeus.mutate(
        { updateUserPicture: [{ id: data.user.id, file: Zvar('file', 'File!') }, true] },
        { variables: { file: files[0] } }
      );
      pictureFile = updateUserPicture;
    } finally {
      // `updating` is set to false when the image loads
    }
  };

  let deleting = false;
  const deleteUserPicture = async () => {
    if (deleting) return;
    try {
      deleting = true;
      await $zeus.mutate({ deleteUserPicture: [{ id: data.user.id }, true] });
      pictureFile = '';
    } finally {
      deleting = false;
    }
  };
</script>

<h1>Éditer <a href="..">{data.user.firstName} {data.user.nickname} {data.user.lastName}</a></h1>

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
          alt="{data.user.firstName} {data.user.lastName}"
          on:load={() => {
            updating = false;
          }}
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
  <fieldset>
    <legend>Informations personnelles</legend>
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
              {#each data.linkTypes as type}
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
            links = [...links, { type: data.linkTypes[0], value: '' }];
          }}><MajesticonsPlus aria-hidden="true" />Ajouter</button
        >
      </li>
    </ul>
    <p>
      Filière et promotion :
      <InputGroup>
        <select bind:value={majorId}>
          {#each data.schoolGroups as { majors, names }}
            <optgroup label={names.join(', ')}>
              {#each majors as { id, name }}
                <option value={id}>{name}</option>
              {/each}
            </optgroup>
          {/each}
        </select>
        <input type="number" bind:value={graduationYear} size="4" />
      </InputGroup>
    </p>
    <p>
      Anniversaire :
      {#if birthday === null}
        <GhostButton
          on:click={() => {
            birthday = new Date();
          }}
        >
          <MajesticonsPlus aria-label="Ajouter" />
        </GhostButton>
      {:else}
        <input
          type="date"
          value={asDate(birthday).toISOString().slice(0, 10)}
          on:change={({ target }) => {
            birthday = new Date(asInput(target).valueAsNumber);
          }}
        />
        <GhostButton
          on:click={() => {
            // We use null rather than undefined because only null exists in JSON
            // eslint-disable-next-line unicorn/no-null
            birthday = null;
          }}
        >
          <MajesticonsClose aria-label="Supprimer" />
        </GhostButton>
      {/if}
    </p>
    <p>
      <label>
        Adresse : <input type="text" bind:value={address} />
      </label>
    </p>
    <p>
      <label>
        Phone : <input type="tel" bind:value={phone} />
      </label>
    </p>
    <p>
      <Button type="submit" theme="primary" {loading}>Sauvegarder</Button>
    </p>
  </fieldset>
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
