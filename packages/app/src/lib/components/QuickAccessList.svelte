<script lang="ts">
  import { fragment, graphql, type QuickAccessList } from '$houdini';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import ModalDrawer from '$lib/components/ModalDrawer.svelte';
  import { allLoaded } from '$lib/loading';
  import { pinDisplay } from '$lib/pins';
  import { getContext } from 'svelte';
  import { fly } from 'svelte/transition';
  import IconRemoveFilled from '~icons/msl/do-not-disturb-on';
  import IconRemove from '~icons/msl/do-not-disturb-on-outline';

  const mobile = getContext<boolean>('mobile');

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

  $: if (editing && $data?.pins.length === 0) 
    editing = false;
  

  let openMobileDrawer = false;
</script>

{#if mobile && !editing}
  <ModalDrawer bind:open={openMobileDrawer}>
    <svelte:self editing></svelte:self>
  </ModalDrawer>

  <h2>
    Accès rapide
    <ButtonInk on:click={() => {}}
      >{#if editing}Terminé{:else}Modifier{/if}</ButtonInk
    >
  </h2>
{:else}
  <h2>
    Accès rapide
    <ButtonInk
      on:click={() => {
        editing = !editing;
      }}
      >{#if editing}Terminé{:else}Modifier{/if}</ButtonInk
    >
  </h2>

  <ul class="nobullet" class:editing>
    {#each $data?.pins.filter(allLoaded) ?? [] as { path, id } (id)}
      <li transition:fly={{ x: -50, duration: 200 }}>
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

  li {
    display: flex;
    gap: 0.5em;
    align-items: center;
  }

  li a {
    display: flex;
    flex: 1;
    gap: 0.5em;
    align-items: center;
  }

  li a .icon {
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

  ul {
    transition: all 200ms ease;
  }

  .remove-button {
    transition: opacity 150ms ease;
  }

  ul:not(.editing) {
    translate: -2em;
  }

  ul:not(.editing) .remove-button {
    opacity: 0;
  }
</style>
