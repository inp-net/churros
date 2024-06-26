<script lang="ts">
  import { page } from '$app/stores';
  import { fragment, graphql, PendingValue, type FormPage } from '$houdini';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputLongText from '$lib/components/InputLongText.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import ModalDeleteCustomPage from '$lib/components/ModalDeleteCustomPage.svelte';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import { formatDate } from '$lib/dates';
  import { allLoaded, loaded, loading, onceLoaded, type MaybeLoading } from '$lib/loading';
  import { toasts } from '$lib/toasts';
  import type { Snapshot } from '@sveltejs/kit';
  import { subDays } from 'date-fns';
  import IconBack from '~icons/mdi/arrow-left';
  import IconDelete from '~icons/mdi/delete-outline';

  export const snapshot: Snapshot = {
    capture: () => ({ title, body }),
    restore: (cached) => {
      if (!('title' in cached && 'body' in cached)) return;
      if (title !== cached.title || body !== cached.body)
        toasts.success('Modifications restaurées 😉');
      ({ title, body } = cached);
    },
  };

  export let saveChanges: (data: { title: string; body: string }) => Promise<void>;
  export let pageItem: FormPage;
  $: data = fragment(
    pageItem,
    graphql(`
      fragment FormPage on Page @loading(cascade: true) {
        ...ModalDeleteCustomPage @loading
        id
        body
        bodyHtml
        title
        path
        updatedAt
        canBeEdited
        group {
          uid
        }
        studentAssociation {
          uid
        }
        lastAuthor {
          uid
          pictureURL
          pictureFile
          fullName
        }
      }
    `),
  );

  let title: string = '';
  let body: string = '';
  let bodyHtml: MaybeLoading<string> = PendingValue;
  let openDeletionConfirmation: () => void;

  let saving = false;
  $: previewing =
    'currentTab' in $page.state
      ? $page.state.currentTab === '#preview'
      : $page.url.hash === '#preview';

  $: if (previewing) {
    bodyHtml = PendingValue;
    fetch('/markdown', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdown: body }),
    })
      .then(async (res) => {
        if (res.ok) {
          const responseData = await res.json();
          return responseData.html;
        }
        return res.text;
      })
      .then((html) => {
        bodyHtml = html;
      });
  }

  $: if ($data && allLoaded($data) && !title && !body) ({ title, body, bodyHtml } = $data);
  $: linkedResource = $data?.group ? 'groups' : 'student-associations';
  // @ts-expect-error can't figure out why .studentAssocaition specifically is 'not present' on $data when it clearly is. It even works, linkedResourceUid gets the right value.
  $: linkedResourceUid = $data?.group?.uid ?? $data?.studentAssociation!.uid;
</script>

{#if $data}
  <!-- @ts-expect-error same weird behavior as for linkedResourceUid, it thinks the fragment does not exist -->
  <ModalDeleteCustomPage bind:openDeletionConfirmation customPage={$data}></ModalDeleteCustomPage>
  <form
    on:submit|preventDefault={async () => {
      if (!allLoaded(page)) return;
      saving = true;
      await saveChanges({ title, body });
      saving = false;
    }}
  >
    <h1>
      <slot name="before-title">
        <ButtonBack
          go={onceLoaded(
            linkedResourceUid,
            (uid) => onceLoaded($data.path, (path) => `/${linkedResource}/${uid}/${path}`, ''),
            '',
          )}
        ></ButtonBack>
      </slot>
      <div class="title-input">
        {#if loaded($data.title)}
          <InputText bind:value={title} label=""></InputText>
        {:else}
          <LoadingText>Lorem ipsum dolor sit amet, consequitur jsp</LoadingText>
        {/if}
      </div>
    </h1>
    <section class="metadata">
      <p class="muted">
        Dernière modification le <LoadingText
          value={loaded($data.updatedAt) ? formatDate($data.updatedAt) : PendingValue}
        >
          {formatDate(subDays(new Date(), 5))}
        </LoadingText>
        {#if loading($data.canBeEdited, false) && allLoaded($data.lastAuthor) && $data.lastAuthor}
          par <AvatarPerson inline small href="/users/{$data.lastAuthor.uid}" {...$data.lastAuthor}
          ></AvatarPerson>
        {/if}
      </p>
    </section>
    <NavigationTabs
      tabs={[
        { href: previewing ? '#edit' : '.', name: 'Modifier' },
        { href: previewing ? '.' : '#preview', name: 'Aperçu' },
      ]}
    ></NavigationTabs>
    {#if previewing}
      <div data-user-html>
        {#if loaded(bodyHtml)}
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html bodyHtml}
        {:else}
          <LoadingText>{body}</LoadingText>
        {/if}
      </div>
    {:else}
      <div>
        {#if loaded($data.body)}
          <InputLongText bind:value={body} label="Contenu"></InputLongText>
        {:else}
          <LoadingText lines={20}></LoadingText>
        {/if}
      </div>
    {/if}
    <section class="actions">
      <ButtonSecondary
        icon={IconBack}
        href={onceLoaded(linkedResourceUid, (uid) => `/${linkedResource}/${uid}/edit/pages`, '')}
        >Toutes les pages</ButtonSecondary
      >
      <ButtonSecondary icon={IconDelete} danger on:click={() => openDeletionConfirmation()}>
        Supprimer
      </ButtonSecondary>
      <ButtonPrimary loading={saving} submits>Enregistrer</ButtonPrimary>
    </section>
  </form>
{/if}

<style>
  h1 {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: 1rem;
  }

  .title-input {
    flex: 1;
  }

  .title-input :global(input) {
    font-size: 1em;
  }

  section.actions {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    align-items: center;
    margin-top: 1rem;
  }

  section.metadata {
    margin-bottom: 2rem;
  }

  section.metadata p {
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.5ch;
    align-items: center;
  }
</style>
