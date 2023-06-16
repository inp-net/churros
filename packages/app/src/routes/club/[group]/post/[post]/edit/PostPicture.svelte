<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import Button from '$lib/components/buttons/Button.svelte';
  import FileInput from '$lib/components/inputs/FileInput.svelte';
  import Loader from '$lib/components/loaders/Loader.svelte';
  import UserPicture from '$lib/components/pictures/UserPicture.svelte';
  import { $ as Zvar, zeus } from '$lib/zeus';
  import IconEdit from '~icons/mdi/pencil';

  export let article: { pictureFile: string; id: string; name: string };

  let { pictureFile } = article;

  let files: FileList;
  let updating = false;
  const updateArticlePicture = async () => {
    if (updating) return;
    try {
      updating = true;
      const { updateArticlePicture } = await $zeus.mutate(
        { updateArticlePicture: [{ id: article.id, file: Zvar('file', 'File!') }, true] },
        { variables: { file: files[0] } }
      );
      // Add a timestamp to the URL to force the browser to reload the image
      pictureFile = `${updateArticlePicture}?v=${Date.now()}`;
    } finally {
      // `updating` is set to false when the image loads
    }
  };

  let deleting = false;
  const deleteArticlePicture = async () => {
    if (deleting) return;
    try {
      deleting = true;
      const deleted = await $zeus.mutate({ deleteArticlePicture: [{ id: article.id }, true] });
      if (deleted) pictureFile = '';
    } finally {
      deleting = false;
    }
  };
</script>

<form on:submit|preventDefault>
  <fieldset>
    <legend>Image de l'article</legend>
    <FileInput bind:files on:change={updateArticlePicture} accept="image/jpeg,image/png">
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
          alt={article.name}
          on:load={() => {
            updating = false;
          }}
        />
      </div>
    </FileInput>
    {#if pictureFile}
      <p>
        <Button type="button" theme="danger" loading={deleting} on:click={deleteArticlePicture}
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
