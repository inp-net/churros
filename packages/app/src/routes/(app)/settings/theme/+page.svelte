<script lang="ts">
  import { graphql } from '$houdini';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import InputRadios from '$lib/components/InputRadios.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import PickGroup from '$lib/components/PickGroup.svelte';
  import { mutate } from '$lib/mutations';
  import { editingTheme, theme } from '$lib/theme';
  import { toasts } from '$lib/toasts';
  import type { PageData } from './$houdini';
  import ThemePreviewCard from './ThemePreviewCard.svelte';

  export let data: PageData;
  $: ({ PageSettingsTheme } = data);

  const NewTheme = graphql(`
    mutation CreateNewTheme($group: UID!) {
      upsertTheme(group: $group, name: "", prefill: true) {
        ...MutationErrors
        ... on MutationUpsertThemeSuccess {
          data {
            localID
            ...ThemesEditorSidebar
          }
        }
      }
    }
  `);
</script>

<MaybeError result={$PageSettingsTheme} let:data={{ themes, me }}>
  <div class="contents">
    <header>
      <div class="mode">
        <InputRadios
          options={{
            auto: 'Suivre le système',
            dark: 'Sombre',
            light: 'Clair',
          }}
          bind:value={$theme.variant}
        />
      </div>
    </header>
    <section class="themes">
      {#each themes as theme}
        <ThemePreviewCard {theme} />
      {/each}
      <ThemePreviewCard theme={null} />
    </section>
    <section class="new">
      <PickGroup
        let:open
        title="Groupe responsable du thème"
        value={null}
        options={me?.canCreateThemesOn ?? []}
        on:finish={async ({ detail }) => {
          const result = await mutate(NewTheme, { group: detail });
          if (
            toasts.mutation(result, 'upsertTheme', 'Thème créé', 'Impossible de créer le thème')
          ) {
            $editingTheme = {
              id: result.data.upsertTheme.data.localID,
              variant: $theme.variant,
            };
          }
        }}
      >
        <ButtonInk on:click={open}>Créer un nouveau thème…</ButtonInk>
      </PickGroup>
    </section>
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }

  header {
    display: flex;
    flex-direction: column;
    gap: 1em 0;
    margin-bottom: 2em;
    text-align: center;
  }

  section.themes {
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
  }

  section.new {
    margin-top: 2rem;
  }

  @media (max-width: 530px) {
    section.themes {
      justify-content: center;
    }
  }

  .mode {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    align-items: center;
  }
</style>
