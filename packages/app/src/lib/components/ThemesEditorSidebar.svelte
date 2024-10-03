<script lang="ts">
  import {
    fragment,
    graphql,
    type ThemesEditorSidebar,
    type ThemeVariable$options,
    type ThemeVariant$options,
  } from '$houdini';
  import InputTextGhost from '$lib/components/InputTextGhost.svelte';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import { DISPLAY_THEME_VARIABLE, DISPLAY_THEME_VARIANT } from '$lib/display';
  import { mutate, mutateAndToast } from '$lib/mutations';
  import { THEME_CSS_VARIABLE_NAMES, isDark } from '$lib/theme';
  import { toasts } from '$lib/toasts';
  import { tooltip } from '$lib/tooltip';
  import { onMount } from 'svelte';

  export let theme: ThemesEditorSidebar | null;
  $: data = fragment(
    theme,
    graphql(`
      fragment ThemesEditorSidebar on Theme @loading {
        name
        localID
        author {
          uid
          ...AvatarGroup
        }
        darkValues: values(variant: Dark) {
          variable
          value
        }
        lightValues: values(variant: Light) {
          variable
          value
        }
      }
    `),
  );

  let baseValuesGetter: HTMLDivElement;
  function baseValues(
    variant: ThemeVariant$options,
    baseValuesGetter: HTMLDivElement,
  ): Record<ThemeVariable$options, string> {
    if (!baseValuesGetter)
      return Object.fromEntries(
        Object.keys(THEME_CSS_VARIABLE_NAMES).map((v) => [v, '']),
      ) as Record<ThemeVariable$options, string>;

    const getter = baseValuesGetter.querySelector(`.${variant}`);
    if (!getter)
      return Object.fromEntries(
        Object.keys(THEME_CSS_VARIABLE_NAMES).map((v) => [v, '']),
      ) as Record<ThemeVariable$options, string>;

    return Object.fromEntries(
      Object.keys(THEME_CSS_VARIABLE_NAMES).map((variable) => {
        const value = getComputedStyle(getter).getPropertyValue(
          `--${THEME_CSS_VARIABLE_NAMES[variable as ThemeVariable$options]}`,
        );
        return [variable, value];
      }),
    ) as Record<ThemeVariable$options, string>;
  }

  function actualValues() {
    return {
      Dark: {
        ...baseValues('Dark', baseValuesGetter),
        ...Object.fromEntries($data?.darkValues.map((v) => [v.variable, v.value]) ?? []),
      },
      Light: {
        ...baseValues('Light', baseValuesGetter),
        ...Object.fromEntries($data?.lightValues.map((v) => [v.variable, v.value]) ?? []),
      },
    };
  }

  function colorValues(values: Record<ThemeVariable$options, string>) {
    return Object.entries(values).filter(([v]) => v.startsWith('Color')) as Array<
      [ThemeVariable$options & `Color${string}`, string]
    >;
  }

  let selectedVariant: ThemeVariant$options | undefined;
  $: selectedVariant ??= $isDark ? 'Dark' : 'Light';

  $: values = actualValues();
  onMount(() => {
    values = actualValues();
  });

  const UpdateValue = graphql(`
    mutation UpdateThemValue(
      $theme: LocalID!
      $variant: ThemeVariant!
      $variable: ThemeVariable!
      $value: String!
    ) {
      setThemeValue(theme: $theme, variant: $variant, variable: $variable, value: $value) {
        id
        ...ThemesEditorSidebar
      }
    }
  `);

  const UpdateName = graphql(`
    mutation UpdateThemeName($theme: LocalID!, $name: String!, $author: UID!) {
      upsertTheme(id: $theme, name: $name, group: $author) {
        ...MutationErrors
        ... on MutationUpsertThemeSuccess {
          data {
            name
          }
        }
      }
    }
  `);
</script>

<article class="sidebar">
  <h2>Modifier un thème</h2>

  <section class="infos">
    <InputTextGhost
      placeholder="Nom du thème"
      label="Nom du thème"
      value={$data?.name}
      on:blur={async ({ detail }) => {
        if (!$data) return;
        if (!$data.author) return;
        await mutateAndToast(UpdateName, {
          theme: $data.localID,
          author: $data.author.uid,
          name: detail,
        });
      }}
    />
  </section>

  <section class="colors">
    <header>
      <NavigationTabs
        tabs={[
          { name: 'Light', active: selectedVariant === 'Light' },
          { name: 'Dark', active: selectedVariant === 'Dark' },
        ]}
        on:click={({ detail }) => {
          selectedVariant = detail;
        }}
      >
        <svelte:fragment slot="tab" let:tab>
          {DISPLAY_THEME_VARIANT[tab]}
        </svelte:fragment>
      </NavigationTabs>
    </header>
    {#each colorValues(values[selectedVariant ?? 'Light']) as [variable, value]}
      <label
        class="swatch"
        use:tooltip={`${variable}: ${DISPLAY_THEME_VARIABLE[variable]}<br>
        <em><code>${value}</code></em>`}
        style:background-color={value}
      >
        <input
          type="color"
          name=""
          id=""
          {value}
          on:input={async ({ currentTarget }) => {
            if (!(currentTarget instanceof HTMLInputElement)) return;
            if (!$data) return;
            const result = await mutate(UpdateValue, {
              theme: $data.localID,
              value: currentTarget.value,
              variant: selectedVariant,
              variable: variable,
            });
            if (!result || result.errors) {
              toasts.error(
                'Impossible de mettre à jour la valeur',
                result?.errors?.map((e) => e.message).join(', ') ?? '',
              );
              return;
            }
            document.documentElement.style.setProperty(
              `--${THEME_CSS_VARIABLE_NAMES[variable]}`,
              currentTarget.value,
            );
            values[selectedVariant ?? 'Light'][variable] = currentTarget.value;
          }}
        />
      </label>
    {/each}
  </section>

  <div class="base-values-getter" bind:this={baseValuesGetter}>
    <div class="Dark" data-force-default-theme="dark"></div>
    <div class="Light" data-force-default-theme="light"></div>
  </div>
</article>

<style>
  .sidebar {
    height: 100%;
    padding: 1rem;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .colors {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
  }

  .colors header {
    width: 100%;
  }

  .swatch input {
    display: none;
  }

  .swatch {
    height: 3rem;
    width: 3rem;
    border-radius: 10000px;
    outline: 1px solid var(--fg);
  }
</style>
