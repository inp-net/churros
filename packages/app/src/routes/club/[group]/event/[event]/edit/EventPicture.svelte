<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import Button from '$lib/components/buttons/Button.svelte';
  import FileInput from '$lib/components/inputs/FileInput.svelte';
  import Loader from '$lib/components/loaders/Loader.svelte';
  import UserPicture from '$lib/components/pictures/UserPicture.svelte';
  import { $ as Zvar, zeus } from '$lib/zeus';
  import IconEdit from '~icons/mdi/pencil';

  export let event: { pictureFile: string; id: string; title: string };

  let { pictureFile } = event;

  let files: FileList;
  let updating = false;
  const updateEventPicture = async () => {
    if (updating) return;
    try {
      updating = true;
      const { updateEventPicture } = await $zeus.mutate(
        { updateEventPicture: [{ id: event.id, file: Zvar('file', 'File!') }, true] },
        { variables: { file: files[0] } }
      );
      // Add a timestamp to the URL to force the browser to reload the image
      pictureFile = `${updateEventPicture}?v=${Date.now()}`;
    } finally {
      // `updating` is set to false when the image loads
    }
  };

  let deleting = false;
  const deleteEventPicture = async () => {
    if (deleting) return;
    try {
      deleting = true;
      const deleted = await $zeus.mutate({ deleteEventPicture: [{ id: event.id }, true] });
      if (deleted) pictureFile = '';
    } finally {
      deleting = false;
    }
  };
</script>

<form on:submit|preventDefault>
  <fieldset>
    <legend>Image de l'article</legend>
    <FileInput bind:files on:change={updateEventPicture} accept="image/jpeg,image/png">
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
          alt={event.title}
          on:load={() => {
            updating = false;
          }}
        />
      </div>
    </FileInput>
    {#if pictureFile}
      <p>
        <Button type="button" theme="danger" loading={deleting} on:click={deleteEventPicture}
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
