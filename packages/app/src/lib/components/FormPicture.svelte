<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import Button from '$lib/components/Button.svelte';
  import FileInput from '$lib/components/InputFile.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import PictureUser from '$lib/components/PictureUser.svelte';
  import { $ as Zvar, zeus } from '$lib/zeus';
  import IconEdit from '~icons/mdi/pencil';

  export const LEGENDS = {
    Group: 'Logo du groupe',
    User: 'Photo de profil',
    Article: 'Photo de l’article',
    Event: 'Photo de l’événement',
  };
  export let objectName: 'Group' | 'User' | 'Article' | 'Event';
  export let object: { pictureFile: string; uid: string };
  export let alt = '';
  $: ({ pictureFile, uid } = object);
  $: alt = alt || uid;

  let files: FileList;
  let updating = false;
  const updatePicture = async () => {
    if (updating) return;
    try {
      updating = true;
      const result = await $zeus.mutate(
        { [`update${objectName}Picture`]: [{ uid, file: Zvar('file', 'File!') }, true] },
        { variables: { file: files[0] } }
      );
      // Add a timestamp to the URL to force the browser to reload the image
      pictureFile = `${result[`update${objectName}Picture`]}?v=${Date.now()}`;
    } finally {
      // `updating` is set to false when the image loads
    }
  };

  let deleting = false;
  const deletePicture = async () => {
    if (deleting) return;
    try {
      deleting = true;
      const deleted = await $zeus.mutate({ [`delete${objectName}Picture`]: [{ uid }, true] });
      if (deleted) pictureFile = '';
    } finally {
      deleting = false;
    }
  };
</script>

<form on:submit|preventDefault>
  <fieldset>
    <legend>{LEGENDS[objectName]}</legend>
    <FileInput bind:files on:change={updatePicture} accept="image/jpeg,image/png">
      <div class="relative">
        <div class="picture-edit">
          {#if updating}
            <Loader />
          {:else}
            <IconEdit />
          {/if}
        </div>
        <PictureUser
          src={pictureFile
            ? `${PUBLIC_STORAGE_URL}${pictureFile}`
            : 'https://via.placeholder.com/160'}
          {alt}
          on:load={() => {
            updating = false;
          }}
        />
      </div>
    </FileInput>
    {#if pictureFile}
      <p>
        <Button type="button" theme="danger" loading={deleting} on:click={deletePicture}
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
