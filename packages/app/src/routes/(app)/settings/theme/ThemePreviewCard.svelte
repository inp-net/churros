<script lang="ts">
  import { fragment, graphql, type ThemePreviewCard } from '$houdini';
  import Badge from '$lib/components/Badge.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { allLoaded, loaded, loading } from '$lib/loading';
  import { theme as currentTheme, isDark, THEME_CSS_VARIABLE_NAMES } from '$lib/theme';
  import IconFeur from '~icons/msl/home-outline';

  export let theme: ThemePreviewCard | null;
  $: data = fragment(
    theme,
    graphql(`
      fragment ThemePreviewCard on Theme @loading {
        id
        localID
        name
        lightValues: values(variant: Light) {
          value
          variable
          variant
        }
        darkValues: values(variant: Dark) {
          value
          variable
          variant
        }
      }
    `),
  );

  $: values = $data ? ($isDark ? $data.darkValues : $data.lightValues) : null;
</script>

<label
  data-force-default-theme={$data ? undefined : $isDark ? 'dark' : 'light'}
  for="theme-preview-{$data ? loading($data.localID, '') : 'system'}"
  style={values && allLoaded(values)
    ? values
        .map(({ value, variable }) => `--${THEME_CSS_VARIABLE_NAMES[variable]}: ${value}`)
        .join('; ')
    : ''}
>
  <input
    type="radio"
    name="theme-preview-{$data ? loading($data.localID, '') : 'system'}"
    id="theme-preview-{$data ? loading($data.localID, '') : 'system'}"
    checked={(loading($data?.localID, undefined) ?? 'system') === $currentTheme.id}
    on:change={({ currentTarget }) => {
      if (!loaded($data?.localID)) return;
      if (!(currentTarget instanceof HTMLInputElement)) return;
      $currentTheme.id = currentTarget.checked ? ($data?.localID ?? 'system') : 'system';
    }}
  />
  <div
    class="inert-content"
    inert
    style:background="url('{loading(
      values?.find((v) => v.variable === 'PatternBackground')?.value,
      '',
    ) ?? ''}')"
  >
    <div class="selected-badge"><Badge theme="success">Sélectionné</Badge></div>
    <div class="surface">
      <ButtonPrimary>Feur</ButtonPrimary>
      <p>Lorem ipsum dolor sit amet</p>
      <div class="submenu">
        <Submenu>
          <SubmenuItem icon={IconFeur} subtext="Quoicoubaka" chevron>Feur</SubmenuItem>
        </Submenu>
      </div>
    </div>
  </div>
  <header>
    <h2><LoadingText value={$data?.name ?? 'Par défaut'}></LoadingText></h2>
  </header>
</label>

<style>
  input {
    display: none;
  }

  label {
    display: flex;
    flex-direction: column;
    width: 15rem;
    overflow: hidden;
    color: var(--fg);
    cursor: pointer;
    border: var(--primary) solid var(--border-block);
    border-radius: var(--radius-block);
  }

  .selected-badge {
    margin: 1em 0 0 1em;
    font-size: 1.2em;
  }

  input:not(:checked) + .inert-content .selected-badge {
    opacity: 0;
  }

  header {
    display: flex;
    flex-grow: 1;
    flex-wrap: wrap;
    gap: 0 1em;
    padding: 1em;
    color: var(--primary);
    background-color: var(--primary-bg);
  }

  header h2 {
    display: flex;
    align-items: end;
    font-size: 1.2rem;
  }

  .surface {
    width: 10rem;
    height: 6rem;
    padding: 1rem;
    margin-top: 1rem;
    margin-left: auto;
    font-size: 0.5em;
    background-color: var(--bg2);
    border-top-left-radius: var(--radius-block);
  }

  .surface .submenu {
    margin-top: 1em;
  }

  .surface .submenu :global(*) {
    font-size: 0.5rem !important;
  }

  .surface .submenu :global(.submenu-item) {
    min-height: unset;
    padding: 1em 0.7em;
  }

  .surface p {
    margin-top: 0.5rem;
    font-size: 0.5rem;
    line-height: 1;
  }
</style>
