<script lang="ts">
  import { fragment, graphql, type QuickAccessList } from '$houdini';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import ModalDrawer from '$lib/components/ModalDrawer.svelte';
  import { allLoaded } from '$lib/loading';
  import { isMobile } from '$lib/mobile';
  import { pinDisplay } from '$lib/pins';
  import { createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import IconBookmark from '~icons/msl/bookmark-outline';
  import IconRemoveFilled from '~icons/msl/do-not-disturb-on';
  import IconRemove from '~icons/msl/do-not-disturb-on-outline';
  import IconDots from '~icons/msl/more-vert';

  const dispatch = createEventDispatcher<{ finishEditing: undefined }>();

  const mobile = isMobile();

  export let pins: QuickAccessList | null;
  $: data = fragment(
    pins,
    graphql(`
      fragment QuickAccessList on User {
        pins @list(name: "List_Pins") {
          id
          path
        }
      }
    `),
  );

  const RemovePin = graphql(`
    mutation Unpin($path: String!) {
      unpin(path: $path) {
        id @Pin_delete
      }
    }
  `);

  export let editing = false;

  $: if (!mobile && editing && $data?.pins.length === 0) editing = false;

  let openMobileDrawer = false;
</script>

{#if mobile && !editing}
  <h2>
    Accès rapide
    <ModalDrawer bind:open={openMobileDrawer}>
      <ButtonInk slot="trigger" on:click={() => {}}>Modifier</ButtonInk>
      <div class="modal-content">
        <svelte:self
          editing
          {pins}
          on:finishEditing={() => {
            openMobileDrawer = false;
          }}
        ></svelte:self>
      </div>
    </ModalDrawer>
  </h2>

  <ul class="nobullet cards">
    {#each $data?.pins.filter(allLoaded) ?? [] as { path, id } (id)}
      <li class="card" transition:scale={{ duration: 200 }}>
        <a href={path}>
          {#await pinDisplay(path)}
            <LoadingText>{path}</LoadingText>
          {:then data}
            {#if data}
              {@const { title, icon } = data}
              <div class="icon">
                {#if typeof icon === 'string'}
                  <img src={icon} aria-hidden alt="" />
                {:else}
                  <svelte:component this={icon}></svelte:component>
                {/if}
              </div>
              <span class="label">{title}</span>
            {:else}
              <span class="label">{path}</span>
            {/if}
          {:catch}
            <span class="label">{path}</span>
          {/await}
        </a>
      </li>
    {:else}
      <li class="muted">
        <p>
          Aucune page épinglée à l'accès rapide. Utilise
          <IconDots></IconDots> puis <IconBookmark></IconBookmark>&nbsp;Accès rapide pour en
          ajouter.
        </p>
      </li>
    {/each}
  </ul>
{:else}
  <h2>
    Accès rapide
    <ButtonInk
      on:click={() => {
        editing = !editing;
        dispatch('finishEditing');
      }}
      >{#if editing}Terminé{:else}Modifier{/if}</ButtonInk
    >
  </h2>

  <ul
    class="nobullet items"
    class:editing
    class:empty={($data?.pins.filter(allLoaded)?.length ?? 0) === 0}
  >
    {#each $data?.pins.filter(allLoaded) ?? [] as { path, id } (id)}
      <li class="item" transition:fly={{ x: -50, duration: 200 }}>
        <div class="remove-button">
          <ButtonGhost
            on:click={async () => {
              await RemovePin.mutate(
                { path },
                {
                  optimisticResponse: {
                    unpin: { id },
                  },
                },
              );
            }}
          >
            <IconRemove></IconRemove>
            <svelte:fragment slot="hovering">
              <IconRemoveFilled></IconRemoveFilled>
            </svelte:fragment>
          </ButtonGhost>
        </div>
        <a href={path}>
          {#await pinDisplay(path)}
            <LoadingText>{path}</LoadingText>
          {:then data}
            {#if data}
              {@const { title, icon } = data}
              <div class="icon">
                {#if typeof icon === 'string'}
                  <img src={icon} aria-hidden alt="" />
                {:else}
                  <svelte:component this={icon}></svelte:component>
                {/if}
              </div>
              {title}
            {:else}
              {path}
            {/if}
          {:catch}
            {path}
          {/await}
        </a>
      </li>
    {:else}
      <li class="muted">
        <p>
          Aucune page épinglée à l'accès rapide. Utilise
          <IconDots></IconDots> puis <IconBookmark></IconBookmark>&nbsp;Accès rapide pour en
          ajouter.
        </p>
      </li>
    {/each}
  </ul>
{/if}

<style>
  h2 {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .cards {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 6rem;
    height: 6rem;
    padding: 0.5rem;
    overflow: hidden;
    border-radius: var(--radius-block);
    box-shadow: var(--shadow);
  }

  .card a {
    overflow: hidden;
  }

  .card .label {
    display: block;
    width: 100%;
    overflow: hidden;
    font-size: 0.8em;
    text-overflow: ellipsis;
    text-wrap: nowrap;
  }

  .card .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 3rem;
    font-size: 2rem;
  }

  .item {
    display: flex;
    gap: 0.5em;
    align-items: center;
  }

  .item a {
    display: flex;
    flex: 1;
    gap: 0.5em;
    align-items: center;
  }

  .item a .icon {
    display: flex;
    align-items: center;
  }

  li a .icon img {
    width: 1em;
    height: 1em;
    overflow: hidden;
    border-radius: 10000px;
  }

  .remove-button,
  .icon {
    font-size: 1.2em;
  }

  .items {
    transition: all 200ms ease;
  }

  .remove-button {
    transition: opacity 150ms ease;
  }

  .items:not(.editing, .empty) {
    translate: -2em;
  }

  .items:not(.editing) .remove-button {
    opacity: 0;
  }

  .modal-content {
    padding: 0.5rem 1rem;
  }
</style>
