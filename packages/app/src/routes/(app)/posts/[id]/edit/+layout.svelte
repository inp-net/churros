<script lang="ts">
  import { page } from '$app/stores';
  import AvatarGroup from '$lib/components/AvatarGroup.houdini.svelte';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import IconLinks from '$lib/components/IconLinkVariant.svelte';
  import InputLongText from '$lib/components/InputLongText.svelte';
  import InputTextGhost from '$lib/components/InputTextGhost.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import PickGroup from '$lib/components/PickGroup.svelte';
  import Split from '$lib/components/Split.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { DISPLAY_VISIBILITIES } from '$lib/display';
  import { LoadingText, loading, mapAllLoading, mapLoading } from '$lib/loading';
  import { isMobile } from '$lib/mobile';
  import { mutateAndToast } from '$lib/mutations';
  import { route } from '$lib/ROUTES';
  import IconLinkedEvent from '~icons/msl/event-outline';
  import IconPicture from '~icons/msl/image-outline';
  import IconParagraph from '~icons/msl/text-ad-outline';
  import IconVisibility from '~icons/msl/visibility-outline';
  import type { PageData } from './$houdini';
  import { ChangeBody, ChangeGroup, ChangeTitle } from './mutations';

  const mobile = isMobile();

  export let data: PageData;
  $: ({ LayoutPostEdit } = data);

  let layoutErrored = false;
</script>

<Split mobilePart={$page.route.id === '/(app)/posts/[id]/edit/body' ? 'left' : 'right'}>
  <svelte:fragment slot="left">
    <MaybeError bind:errored={layoutErrored} result={$LayoutPostEdit} let:data={{ post, me }}>
      <div class="basic-info" class:mobile>
        <div class="avatar">
          <AvatarGroup group={post.group} />
        </div>
        <div class="group">
          Par <LoadingText value={post.group.name}></LoadingText>
          <PickGroup
            title="Organisateur"
            value={post.group.uid}
            options={me?.canCreatePostsOn ?? []}
            let:open
            on:finish={async ({ detail: newGroupUid }) => {
              await mutateAndToast(ChangeGroup, {
                post: $page.params.id,
                group: newGroupUid,
              });
            }}
          >
            <ButtonInk insideProse on:click={open}>Changer</ButtonInk>
          </PickGroup>
          <div class="title">
            <InputTextGhost
              value={post.title}
              placeholder="Ajouter un titre…"
              label="Titre de l'évènement"
              on:blur={async ({ detail }) => {
                await mutateAndToast(ChangeTitle, {
                  post: $page.params.id,
                  title: detail,
                });
              }}
            />
          </div>
        </div>
      </div>
      {#if mobile}
        <div class="contents">
          <InputLongText
            rows={10}
            rich
            label=""
            value={loading(post.body, 'Chargement…')}
            on:blur={async ({ currentTarget }) => {
              if (!(currentTarget instanceof HTMLTextAreaElement)) return;
              await mutateAndToast(ChangeBody, {
                post: $page.params.id,
                body: currentTarget.value,
              });
            }}
          />
        </div>
      {/if}
      <Submenu>
        {#if !mobile}
          <SubmenuItem icon={IconParagraph} href={route('/posts/[id]/edit/body', $page.params.id)}>
            Contenu
          </SubmenuItem>
        {/if}
        <SubmenuItem
          icon={IconVisibility}
          href={route('/posts/[id]/edit/visibility', $page.params.id)}
          subtext={mapLoading(post.visibility, (vis) => DISPLAY_VISIBILITIES[vis])}
        >
          Visibilité
        </SubmenuItem>
        <SubmenuItem
          icon={IconLinks}
          href={route('/posts/[id]/edit/links', $page.params.id)}
          subtext={mapAllLoading(
            post.links.map((l) => l.id),
            (...links) =>
              links.length === 0
                ? 'Aucun lien'
                : `${links.length} lien${links.length > 1 ? 's' : ''}`,
          )}
        >
          Liens
        </SubmenuItem>
        <SubmenuItem
          icon={IconLinkedEvent}
          href={route('/posts/[id]/edit/event', $page.params.id)}
          subtext={mapLoading(post.event?.title, (title) => title ?? `Aucun`)}
        >
          Évènement lié
        </SubmenuItem>
        <SubmenuItem icon={IconPicture} href={route('/posts/[id]/edit/picture', $page.params.id)}>
          Image
        </SubmenuItem>
      </Submenu>
    </MaybeError>
  </svelte:fragment>
  <div slot="right">
    {#if !layoutErrored}
      <slot></slot>
    {/if}
  </div>
</Split>

<style>
  .basic-info {
    display: flex;
    gap: 1rem;
    padding: 0 1rem;
    margin-bottom: 2rem;
  }

  .basic-info.mobile {
    margin-bottom: 0.5rem;
  }

  .contents {
    padding: 0 1rem;
    margin-bottom: 4rem;
  }

  .avatar {
    --avatar-size: 3rem;
  }

  .title {
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }
</style>
