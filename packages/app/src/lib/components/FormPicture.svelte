<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import IconAdd from '~icons/mdi/add';
  import FileInput from '$lib/components/InputFile.svelte';
  import IconTrash from '~icons/mdi/delete';
  import { $ as Zvar, zeus } from '$lib/zeus';
  import IconEdit from '~icons/mdi/pencil';
  import InputField from './InputField.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';

  export const LEGENDS = {
    Group: 'Logo du groupe',
    User: 'Photo de profil',
    Article: 'Photo de l’article',
    Event: 'Photo de l’événement',
  };

  export let objectName: 'Group' | 'User' | 'Article' | 'Event';
  export let object: { pictureFile: string; uid: string; id: string };
  export let alt = '';
  $: ({ pictureFile, uid, id } = object);
  $: alt = alt || uid;

  let files: FileList;
  let inputElement: HTMLInputElement;
  let updating = false;
  const updatePicture = async () => {
    if (updating) return;
    try {
      updating = true;
      const result = await $zeus.mutate(
        {
          [`update${objectName}Picture`]: [
            {
              ...(['Group', 'User'].includes(objectName) ? { uid } : { id }),
              file: Zvar('file', 'File!'),
            },
            true,
          ],
        },
        { variables: { file: files[0] } }
      );
      // Add a timestamp to the URL to force the browser to reload the image
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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

<form data-object={objectName.toLowerCase()} on:submit|preventDefault>
  <InputField label={LEGENDS[objectName]}>
    <div class="wrapper">
      <img
        style:object-fit={objectName === 'Group' ? 'contain' : 'cover'}
        on:load={() => {
          updating = false;
        }}
        src="{PUBLIC_STORAGE_URL}{pictureFile}"
        alt={LEGENDS[objectName]}
      />
      <div class="actions">
        <FileInput
          bind:inputElement
          bind:files
          on:change={updatePicture}
          accept="image/jpeg,image/png"
        />
        <ButtonSecondary
          on:click={() => {
            inputElement.click();
          }}
          icon={pictureFile ? IconEdit : IconAdd}
          >{#if pictureFile}Changer{:else}Ajouter{/if}</ButtonSecondary
        >
        {#if pictureFile}
          <ButtonSecondary icon={IconTrash} danger loading={deleting} on:click={deletePicture}
            >Supprimer</ButtonSecondary
          >
        {/if}
      </div>
    </div>
  </InputField>
</form>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }

  img {
    --size: 10rem;

    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: var(--size);
    height: var(--size);
    color: var(--muted-text);
    background: var(--muted-bg);
    border-radius: var(--border-block);
  }

  [data-object='user'] img {
    border-radius: 50%;
  }

  .actions {
    display: flex;
    flex-flow: column wrap;
    gap: 0.5rem;
  }
</style>
