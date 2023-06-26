<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import Button from '$lib/components/Button.svelte';
  import FileInput from '$lib/components/InputFile.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import UserPicture from '$lib/components/PictureUser.svelte';
  import { $ as Zvar, zeus } from '$lib/zeus';
  import IconEdit from '~icons/mdi/pencil';

  export let club: { pictureFile: string; uid: string; name: string };

  let { pictureFile } = club;

  let files: FileList;
  let updating = false;
  const updateGroupPicture = async () => {
    if (updating) return;
    try {
      updating = true;
      const { updateGroupPicture } = await $zeus.mutate(
        { updateGroupPicture: [{ uid: club.uid, file: Zvar('file', 'File!') }, true] },
        { variables: { file: files[0] } }
      );
      // Add a timestamp to the URL to force the browser to reload the image
      pictureFile = `${updateGroupPicture}?v=${Date.now()}`;
    } finally {
      // `updating` is set to false when the image loads
    }
  };

  let deleting = false;
  const deleteGroupPicture = async () => {
    if (deleting) return;
    try {
      deleting = true;
      const deleted = await $zeus.mutate({ deleteGroupPicture: [{ uid: club.uid }, true] });
      if (deleted) pictureFile = '';
    } finally {
      deleting = false;
    }
  };
</script>

<form on:submit|preventDefault>
  <fieldset>
    <legend>Logo du club</legend>
    <FileInput bind:files on:change={updateGroupPicture} accept="image/jpeg,image/png">
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
          alt={club.name}
          on:load={() => {
            updating = false;
          }}
        />
      </div>
    </FileInput>
    {#if pictureFile}
      <p>
        <Button type="button" theme="danger" loading={deleting} on:click={deleteGroupPicture}
          >Supprimer</Button
        >
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
