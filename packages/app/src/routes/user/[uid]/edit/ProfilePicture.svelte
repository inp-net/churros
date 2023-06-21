<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import Button from '$lib/components/buttons/Button.svelte';
  import FileInput from '$lib/components/inputs/FileInput.svelte';
  import Loader from '$lib/components/loaders/Loader.svelte';
  import UserPicture from '$lib/components/pictures/UserPicture.svelte';
  import { $ as Zvar, zeus } from '$lib/zeus';
  import IconEdit from '~icons/mdi/pencil';
  import type { PageData } from './$types';

  export let data: PageData;

  let { pictureFile } = data.user;

  let files: FileList;
  let updating = false;
  const updateUserPicture = async () => {
    if (updating) return;
    try {
      updating = true;
      const { updateUserPicture } = await $zeus.mutate(
        { updateUserPicture: [{ uid: data.user.uid, file: Zvar('file', 'File!') }, true] },
        { variables: { file: files[0] } }
      );
      // Add a timestamp to the URL to force the browser to reload the image
      pictureFile = `${updateUserPicture}?v=${Date.now()}`;
    } finally {
      // `updating` is set to false when the image loads
    }
  };

  let deleting = false;
  const deleteUserPicture = async () => {
    if (deleting) return;
    try {
      deleting = true;
      await $zeus.mutate({ deleteUserPicture: [{ uid: data.user.uid }, true] });
      pictureFile = '';
    } finally {
      deleting = false;
    }
  };
</script>

<form on:submit|preventDefault>
  <fieldset>
    <legend>Photo de profil</legend>
    <FileInput bind:files on:change={updateUserPicture} accept="image/jpeg,image/png">
      <div class="relative">
        <div class="picture-edit">
          {#if updating}
            <Loader />
          {:else}
            <IconEdit />
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
