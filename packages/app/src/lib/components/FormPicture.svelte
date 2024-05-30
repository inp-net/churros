<script lang="ts">
  import { env } from '$env/dynamic/public';
  import IconAdd from '~icons/mdi/add';
  import FileInput from '$lib/components/InputFile.svelte';
  import IconTrash from '~icons/mdi/delete';
  import { $ as Zvar, zeus } from '$lib/zeus';
  import IconEdit from '~icons/mdi/pencil';
  import InputField from './InputField.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import { toasts } from '$lib/toasts';

  export const LEGENDS = {
    Group: 'Logo du groupe',
    User: 'Photo de profil',
    Article: 'Photo du post',
    Event: 'Photo de l’événement',
    School: 'Logo de l’école',
  };

  export let rectangular = false;
  export let objectName: 'Group' | 'User' | 'Article' | 'Event' | 'School';
  export let dark = false;
  export let object: { pictureFile: string; uid: string; id: string; pictureFileDark?: string };
  export let alt = '';

  $: filepath = dark ? object.pictureFileDark : object.pictureFile;
  const pictureFilePropertyName: 'pictureFile' | 'pictureFileDark' =
    objectName === 'Group' && dark ? 'pictureFileDark' : 'pictureFile';
  $: ({ uid, id } = object);
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
              ...(objectName === 'Group' ? { dark } : {}),
              file: Zvar('file', 'File!'),
            },
            true,
          ],
        },
        { variables: { file: files[0] } },
      );
      toasts.success(`${LEGENDS[objectName]} mis${objectName === 'Group' ? '' : 'e'} à jour`);
      // Add a timestamp to the URL to force the browser to reload the image
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      filepath = `${result[`update${objectName}Picture`]}?v=${Date.now()}`;
    } finally {
      // `updating` is set to false when the image loads
    }
  };

  let deleting = false;
  const deletePicture = async () => {
    if (deleting) return;
    try {
      deleting = true;
      const deleted = await $zeus.mutate({
        [`delete${objectName}Picture`]: [
          {
            ...(['Group', 'User'].includes(objectName) ? { uid } : { id }),
            ...(objectName === 'Group' ? { dark } : {}),
          },
          true,
        ],
      });
      if (deleted) object[pictureFilePropertyName] = '';
    } finally {
      deleting = false;
    }
  };
</script>

<form data-object={objectName.toLowerCase()} on:submit|preventDefault>
  <InputField label="{LEGENDS[objectName]}{dark ? ' (Thème sombre)' : ''}">
    <div class="wrapper">
      {#key filepath}
        <img
          class:rectangular
          style:object-fit={objectName === 'Group' ? 'contain' : 'cover'}
          on:load={() => {
            updating = false;
          }}
          src="{env.PUBLIC_STORAGE_URL}{filepath}"
          alt={LEGENDS[objectName]}
        />
      {/key}
      <div class="actions">
        <FileInput
          bind:inputElement
          bind:files
          on:change={updatePicture}
          accept="image/jpeg,image/png,image/webp"
        />
        <ButtonSecondary
          loading={updating}
          on:click={() => {
            inputElement.click();
          }}
          icon={object[pictureFilePropertyName] ? IconEdit : IconAdd}
          >{#if object[pictureFilePropertyName]}Changer{:else}Ajouter{/if}</ButtonSecondary
        >
        {#if object[pictureFilePropertyName]}
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

    // border-radius: var(--border-block);
  }

  img.rectangular {
    width: calc(var(--size) * 1.5);
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
