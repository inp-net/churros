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
  export let pictures: { id: string; path: string; position: Number }[];
  if (pictures === undefined) pictures = [];
  $: index = -1;
  $: pictureId = pictures === undefined ? '' : pictures[index]?.id;
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

      pictures.push(result.updateItemPicture);
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
      if (deleted) pictures[index].path = '';
    } finally {
      deleting = false;
      pictures.splice(index, 1);
      if (index > 1) index -= 1;
    }
  };
</script>

<form data-object="item" on:submit|preventDefault>
  <InputField label="Photo de l’article">
    <div class="wrapper">
      <div class="caroussel">
        {#key index}
          <ShopImageCaroussel bind:currentIndex={index} url={pictures.map((p) => p.path)} />
        {/key}
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
