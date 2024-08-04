<script lang="ts">
  import { env } from '$env/dynamic/public';
  import FileInput from '$lib/components/InputFile.old.svelte';
  import { toasts } from '$lib/toasts';
  import { zeus } from '$lib/zeus';
  import IconAdd from '~icons/mdi/add';
  import IconTrash from '~icons/mdi/delete';
  import IconEdit from '~icons/mdi/pencil';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import { deleteObjectPicture, mutateObjectPicture } from './FormPicture.tsunsafe';
  import InputField from './InputField.svelte';
  import { graphql } from '$houdini';

  export const LEGENDS = {
    Group: 'Logo du groupe',
    User: 'Photo de profil',
    Article: 'Photo du post',
    Event: 'Photo de l’événement',
    School: 'Logo de l’école',
  };

  graphql(`
    fragment FormPictureOld on Pictured {
      pictureFile
      pictureFileDark
    }
  `);

  export let rectangular = false;
  export let objectName: 'Group' | 'User' | 'Article' | 'Event' | 'School';
  export let dark = false;
  export let object: { pictureFile: string; id: string; pictureFileDark?: string } & (
    | { uid: string }
    | { slug: string }
  );
  export let alt = '';

  $: filepath = dark ? object.pictureFileDark : object.pictureFile;
  const pictureFilePropertyName: 'pictureFile' | 'pictureFileDark' =
    objectName === 'Group' && dark ? 'pictureFileDark' : 'pictureFile';
  $: ({ id } = object);
  $: uid = 'uid' in object ? object.uid : object.slug;
  $: alt = alt || uid;

  let files: FileList;
  let inputElement: HTMLInputElement;
  let updating = false;
  const updatePicture = async () => {
    if (updating) return;
    try {
      updating = true;
      const result = await mutateObjectPicture($zeus, objectName, id, uid, dark, files[0]);
      /* @ts-enable */
      toasts.success(`${LEGENDS[objectName]} mis${objectName === 'Group' ? '' : 'e'} à jour`);
      // Add a timestamp to the URL to force the browser to reload the image
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      filepath = `${result}?v=${Date.now()}`;
    } finally {
      // `updating` is set to false when the image loads
    }
  };

  let deleting = false;
  const deletePicture = async () => {
    if (deleting) return;
    try {
      deleting = true;
      const deleted = await deleteObjectPicture($zeus, objectName, id, uid, dark);
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
