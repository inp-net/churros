<script lang="ts">
  import { page } from '$app/stores';
  import { graphql } from '$houdini';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import InputSearchQuery from '$lib/components/InputSearchQuery.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { loading } from '$lib/loading';
  import type { NavigationTopStateKeys } from '$lib/navigation';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ pick: string | null }>();

  export let q: string = '';
  export let queryPlaceholder = 'Rechercher une personne';
  export let open: () => void = () => {};
  export let implicitClose: () => void = () => {};
  export let statebound: NavigationTopStateKeys | undefined = undefined;

  const SearchResults = graphql(`
    query ModalSearchUser($q: String!) {
      searchUsers(q: $q) {
        user {
          uid
          ...AvatarUser
        }
      }
    }
  `);

  $: if (statebound) {
    page.subscribe(({ state }) => {
      if (state[statebound]) open?.();
      else implicitClose?.();
    });
  }
</script>

<ModalOrDrawer let:close bind:open bind:implicitClose>
  <header slot="header">
    <InputSearchQuery
      placeholder={queryPlaceholder}
      bind:q
      on:debouncedInput={async () => {
        await SearchResults.fetch({ variables: { q } });
      }}
    />
  </header>

  <MaybeError result={$SearchResults} let:data={{ searchUsers }}>
    <section class="result">
      <Submenu>
        {#each searchUsers as { user }}
          <SubmenuItem
            icon={null}
            clickable
            on:click={() => {
              close?.();
              dispatch('pick', loading(user.uid, ''));
            }}
          >
            <AvatarUser name {user} />
          </SubmenuItem>
        {/each}
      </Submenu>
    </section>
  </MaybeError>
</ModalOrDrawer>

<style>
  header {
    width: 100%;
  }
</style>
