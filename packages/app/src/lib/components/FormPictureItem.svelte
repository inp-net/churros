<script lang="ts">
  import FileInput from '$lib/components/InputFile.svelte';
  import { toasts } from '$lib/toasts';
  import { $ as Zvar, zeus } from '$lib/zeus';
  import IconAdd from '~icons/mdi/add';
  import IconTrash from '~icons/mdi/delete';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import InputField from './InputField.svelte';
  import ShopImageCaroussel from './ShopImageCaroussel.svelte';

  export let itemId = '';
  export let groupUid = '';
  export let object: { id: string; path: string; position: Number }[];
  if (object === undefined) object = [];
  $: index = 0;
  $: pictureId = object === undefined ? '' : object[index]?.id;
  let files: FileList;
  let inputElement: HTMLInputElement;
  let updating = false;
  const updatePicture = async () => {
    if (updating) return;
    try {
      updating = true;
      const result = await $zeus.mutate(
        {
          updateItemPicture: [
            {
              itemId,
              groupUid,
              file: Zvar('file', 'File!'),
            },
            {
              id: true,
              path: true,
              position: true,
            },
          ],
        },
        { variables: { file: files[0] } },
      );
      toasts.success(`Photo de l’article mise à jour`);

      // Add a timestamp to the URL to force the browser to reload the image
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      if (object === undefined) 
        object = [result.updateItemPicture];
      
      if (object !== undefined && object.length > 0) {
        object.push(result.updateItemPicture);
        if (object !== undefined && object.length > 0) 
          object.at(-1).path = `${result.updateItemPicture.path}?v=${Date.now()}`;
        
      }
    } finally {
      // `updating` is set to false when the image loads
      updating = false;
      index += 1;
    }
  };

  let deleting = false;
  const deletePicture = async () => {
    if (deleting) return;
    try {
      deleting = true;
      const deleted = await $zeus.mutate({
        [`deleteItemPicture`]: [
          {
            itemId,
            pictureId,
            groupUid,
          },
          true,
        ],
      });
      if (deleted) object[index].path = '';
    } finally {
      deleting = false;
      object.splice(index, 1);
      index -= 1;
    }
  };
</script>

<form data-object="item" on:submit|preventDefault>
  <InputField label="Photo de l’article">
    <div class="wrapper">
      <div class="caroussel">
        <ShopImageCaroussel bind:currentIndex={index} url={object.map((p) => p.path)} />
      </div>
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
          icon={IconAdd}>Ajouter</ButtonSecondary
        >
        <ButtonSecondary icon={IconTrash} danger loading={deleting} on:click={deletePicture}
          >Supprimer</ButtonSecondary
        >
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
    padding: 1em 0;
  }

  .actions {
    display: flex;
    flex-flow: column wrap;
    gap: 0.5rem;
  }

  .caroussel {
    max-width: 400px;
  }
</style>
