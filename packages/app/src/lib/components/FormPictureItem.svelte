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
  $: index = 0;
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
      //@ts-expect-error CF https://dev.to/senichimaro/object-is-possibly-undefinedts2532-k3a
      //C'est vraiment degueu mais il n'y a pas d'autres solutions, si j'index en liste par Array[], les commits hooks ou whatever
      //changent ma ligne en .at(-1) et du coup j'ai l'erreur TS2532
      //Le support microsoft dit que c'est working as Intended ces tocards
      //ts ignore est littéralement la seule solution
      //by the way, cette ligne sert à actualiser l'url de l'image en ajoutant un timestamp
      //côté client qui fait actualiser le composant et qui affiche l'image qui vient d'être uploadée sans reload
      pictures.at(-1).path += `?v=${Date.now()}`;
      if (index !== 0) index += 1;
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
      index -= 1;
    }
  };
</script>

<form data-object="item" on:submit|preventDefault>
  <InputField label="Photo de l’article">
    <div class="wrapper">
      <div class="caroussel">
        <ShopImageCaroussel bind:currentIndex={index} url={pictures.map((p) => p.path)} />
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
