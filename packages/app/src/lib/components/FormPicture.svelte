<script lang="ts">
  import { fragment, graphql, type FormPicture, type ThemeVariant$options } from '$houdini';
  import { loaded, loading } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { toasts } from '$lib/toasts';
  import { tooltip } from '$lib/tooltip';
  import IconDelete from '~icons/msl/delete-outline';
  import IconAccount from '~icons/msl/person';
  import ButtonInk from './ButtonInk.svelte';
  import CardEvent from './CardEvent.svelte';
  import InputFile from './InputFile.svelte';
  import CardArticle from '$lib/components/CardArticle.svelte';

  export let variant: ThemeVariant$options = 'Light';

  export let resource: FormPicture | null;
  $: data = fragment(
    resource,
    graphql(`
      fragment FormPicture on Pictured @loading {
        __typename
        id
        pictureAltText
        lightURL: pictureURL(dark: false, timestamp: true)
        darkURL: pictureURL(dark: true, timestamp: true)
        hasSeparateDarkPicture
        ... on Event {
          ...CardEvent
        }
        ... on Article {
          ...CardArticle
        }
      }
    `),
  );

  $: pictureURL = (variant === 'Light' ? $data?.lightURL : $data?.darkURL) ?? '';

  const Update = graphql(`
    mutation UpdatePicture($resource: ID!, $file: File!, $variant: ThemeVariant!) {
      setPicture(resource: $resource, file: $file, variant: $variant) {
        __typename
        ... on MutationSetPictureSuccess {
          data {
            ...FormPicture
          }
        }
        ...MutationErrors
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
        ...MutationErrors
      }
    }
  `);

  async function deletePicture() {
    if (!$data) return;
    const result = await mutate(Delete, { resource: $data.id, variant });
    toasts.mutation(result, 'setPicture', 'Image supprimée', "Impossible de supprimer l'image");
  }

  let openPicker: () => void;
  $: typename = loading($data?.__typename, '');
</script>

<InputFile
  bind:openPicker
  accept="image/jpeg,image/png,image/webp"
  data-typename={typename}
  on:change={async ({ detail: file }) => {
    if (!loaded($data?.id)) return;
    if (!file) return;
    const result = await Update.mutate({ resource: $data.id, file, variant });
    toasts.mutation(
      result,
      'setPicture',
      'Image mise à jour',
      "Impossible de mettre à jour l'image",
    );
  }}
>
  <div class="preview" data-typename={typename}>
    {#if typename === 'Event'}
      <CardEvent event={$data} />
    {:else if typename === 'Article'}
      <CardArticle hideEvent article={$data} />
    {:else if loaded($data?.lightURL) && loaded($data.pictureAltText) && $data.lightURL}
      <button use:tooltip={'Supprimer'} class="delete" on:click={deletePicture}
        ><IconDelete></IconDelete></button
      >
      <img src={$data.lightURL} alt={$data.pictureAltText} />
    {:else if loaded($data?.darkURL) && loaded($data.pictureAltText) && !$data.lightURL}
      <div class="no-img">
        <IconAccount />
      </div>
    {/if}
  </div>
  <section class="actions">
    {#if ['Event', 'Article'].includes(typename)}
      {#if loaded(pictureURL) && loaded($data?.pictureAltText) && pictureURL}
        <ButtonInk on:click={openPicker}>Changer</ButtonInk>
        <ButtonInk danger on:click={deletePicture}>Supprimer</ButtonInk>
      {:else}
        <ButtonInk on:click={openPicker}>
          {#if typename === 'Event'}
            Ajouter une image de fond
          {:else}
            Ajouter une image
          {/if}
        </ButtonInk>
      {/if}
    {:else}
      <ButtonInk on:click={openPicker}>
        {#if loaded(pictureURL) && loaded($data?.pictureAltText) && pictureURL}
          {#if typename === 'Group'}
            Modifier
          {:else}
            Modifier la photo
          {/if}
        {:else if typename === 'Group'}
          Ajouter
        {:else}
          Ajouter une photo
        {/if}
      </ButtonInk>
    {/if}
  </section>
</InputFile>

<style>
  .preview {
    position: relative;
  }

  .preview[data-typename='Event'] {
    overflow: hidden;
    pointer-events: none;
    background: var(--bg);
    border-radius: 20px;
  }

  .preview[data-typename='User'],
  .preview[data-typename='Group'] {
    width: 7rem;
    height: 7rem;
  }

  .preview img {
    object-fit: cover;
  }

  .preview .no-img {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 5rem;
    color: var(--muted);
    text-align: center;
    background: var(--bg4);
  }

  .preview .no-img,
  .preview img {
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 10000px;
  }

  .preview[data-typename='Event'] img {
    filter: blur(30px) brightness(0.7);
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
    top: -0.25rem;
    right: -0.25rem;
    padding: 0.5rem;
    color: var(--danger);
    cursor: pointer;
    background: var(--bg);
    border: var(--border-block) solid var(--danger);
    border-radius: 10000px;
  }

  .delete:focus-visible,
  .delete:hover {
    background: var(--bg3);
  }
</style>
