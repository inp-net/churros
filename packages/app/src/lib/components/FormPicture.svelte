<script lang="ts">
  import { fragment, graphql } from '$houdini';
  import { loaded, loading } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { toasts } from '$lib/toasts';
  import IconDelete from '~icons/msl/delete-outline';
  import ButtonInk from './ButtonInk.svelte';
  import CardEvent from './CardEvent.svelte';
  import InputFile from './InputFile.svelte';

  export let resource;
  $: data = fragment(
    resource,
    graphql(`
      fragment FormPicture on Pictured @loading {
        __typename
        pictureAltText
        lightURL: pictureURL(dark: false, timestamp: true)
        darkURL: pictureURL(dark: true, timestamp: true)
        hasSeparateDarkPicture
        ... on Event {
          ...CardEvent
        }
      }
    `),
  );

  const Update = graphql(`
    mutation UpdatePicture($resource: ID!, $file: File!, $variant: ThemeVariant!) {
      setPicture(resource: $resource, file: $file, variant: $variant) {
        __typename
        ... on MutationSetPictureSuccess {
          data {
            ...FormPicture
          }
        }
        ... on Error {
          message
        }
        ... on ZodError {
          fieldErrors {
            path
            message
          }
        }
      }
    }
  `);

  const Delete = graphql(`
    mutation DeletePicture($resource: ID!, $variant: ThemeVariant!) {
      setPicture(resource: $resource, file: null, variant: $variant) {
        __typename
        ... on MutationSetPictureSuccess {
          alreadyDeleted # not used in the UI but could be useful for debugging idk
          data {
            ...FormPicture
          }
        }
        ... on Error {
          message
        }
      }
    }
  `);

  async function deletePicture() {
    const result = await mutate(Delete, { resource: $data.id, variant: 'Light' });
    toasts.mutation(result, 'setPicture', 'Image supprimée', "Impossible de supprimer l'image");
  }

  let openPicker: () => void;
</script>

<InputFile
  bind:openPicker
  accept="image/jpeg,image/png,image/webp"
  on:change={async ({ detail: file }) => {
    const result = await mutate(Update, { resource: $data.id, file, variant: 'Light' });
    toasts.mutation(
      result,
      'setPicture',
      'Image mise à jour',
      "Impossible de mettre à jour l'image",
    );
  }}
>
  <div class="preview" data-typename={loading($data.__typename, '')}>
    {#if loading($data.__typename, '') === 'Event'}
      <CardEvent event={$data} />
    {:else if loaded($data.lightURL) && loaded($data.pictureAltText) && $data.lightURL}
      <button class="delete" on:click={deletePicture}><IconDelete></IconDelete></button>
      <img src={$data.lightURL} alt={$data.pictureAltText} />
    {/if}
  </div>
  <section class="actions">
    {#if loading($data.__typename, '') === 'Event'}
      {#if loaded($data.lightURL) && loaded($data.pictureAltText) && $data.lightURL}
        <ButtonInk on:click={openPicker}>Changer</ButtonInk>
        <ButtonInk danger on:click={deletePicture}>Supprimer</ButtonInk>
      {:else}
        <ButtonInk on:click={openPicker}>Ajouter une image de fond</ButtonInk>
      {/if}
    {:else}
      <ButtonInk on:click={openPicker}>Modifier la photo</ButtonInk>
    {/if}
  </section>
</InputFile>

<style>
  .preview {
    position: relative;
    background-color: var(--bg4);
  }

  .preview[data-typename='Event'] {
    overflow: hidden;
    pointer-events: none;
    background: var(--bg);
    border-radius: 20px;
  }

  .preview[data-typename='Event'] img {
    filter: blur(30px) brightness(0.7);
  }

  .preview[data-typename='User'],
  .preview[data-typename='Group'] {
    border-radius: 10000px;
  }

  .actions {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1rem;
  }

  .preview[data-typename='Event'] + .actions {
    justify-content: space-between;
  }

  .delete {
    position: absolute;
    top: 2rem;
    right: 2rem;
  }
</style>
