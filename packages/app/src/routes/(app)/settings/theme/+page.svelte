<script lang="ts">
  import InputRadios from '$lib/components/InputRadios.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { theme } from '$lib/theme';
  import type { PageData } from './$houdini';
  import ThemePreviewCard from './ThemePreviewCard.svelte';

  export let data: PageData;
  $: ({ PageSettingsTheme } = data);
</script>

<MaybeError result={$PageSettingsTheme} let:data={{ themes }}>
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
