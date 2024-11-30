<script lang="ts">
  import {
    fragment,
    graphql,
    PageSettingsThemeStore,
    type ThemeEditorSidebar_Me,
    type ThemesEditorSidebar,
    type ThemeVariable$options,
    type ThemeVariant$options,
  } from '$houdini';
  import AvatarGroup from '$lib/components/AvatarGroup.houdini.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputTextGhost from '$lib/components/InputTextGhost.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import PickGroup from '$lib/components/PickGroup.svelte';
  import { DISPLAY_THEME_VARIABLE, DISPLAY_THEME_VARIANT } from '$lib/display';
  import { loading } from '$lib/loading';
  import { mutate, mutateAndToast } from '$lib/mutations';
  import { refroute } from '$lib/navigation';
  import {
    actualValues,
    colorValues,
    editingTheme,
    forceReloadTheme,
    isDark,
    isImageVariable,
    THEME_CSS_VARIABLE_NAMES,
    urlValues,
  } from '$lib/theme';
  import { toasts } from '$lib/toasts';
  import { tooltip } from '$lib/tooltip';
  import debounce from 'lodash.debounce';
  import { onMount, tick } from 'svelte';
  import IconHelp from '~icons/msl/help-outline';

  export let theme: ThemesEditorSidebar | null;
  $: data = fragment(
    theme,
    graphql(`
      fragment ThemesEditorSidebar on Theme @loading {
        name
        id
        localID
        author {
          uid
          ...AvatarGroup
        }
        ...ThemeValuesForEditing
      }
    `),
  );

  export let me: ThemeEditorSidebar_Me | null;
  $: dataMe = fragment(
    me,
    graphql(`
      fragment ThemeEditorSidebar_Me on User {
        canCreateThemesOn {
          ...PickGroup @mask_disable
        }
      }
    `),
  );

  let baseValuesGetter: HTMLDivElement;
  $: values = actualValues(baseValuesGetter, $data);
  onMount(() => {
    values = actualValues(baseValuesGetter, $data);
  });

  let selectedVariant: ThemeVariant$options | undefined;
  $: selectedVariant ??= $isDark ? 'Dark' : 'Light';

  let openURLsHelp: () => void;

  async function updateValueInAPI(variable: ThemeVariable$options, value: string) {
    if (!$data) return;
    const result = await mutate(UpdateValue, {
      theme: $data.localID,
      value: value,
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

    await new PageSettingsThemeStore().fetch();
  }

  const debouncedUpdateValueInAPI = debounce(updateValueInAPI, 500);

  async function setValue(variable: ThemeVariable$options, value: string) {
    document.documentElement.style.setProperty(
      `--${THEME_CSS_VARIABLE_NAMES[variable]}`,
      isImageVariable(variable) ? `url('${value}')` : value,
    );
    values[selectedVariant ?? 'Light'][variable] = value;
  }

  const DeleteTheme = graphql(`
    mutation DeleteTheme($theme: LocalID!) {
      deleteTheme(id: $theme) {
        ...MutationErrors
        ... on MutationDeleteThemeSuccess {
          data {
            id
          }
        }
      }
    }
  `);

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
            author {
              ...AvatarGroup
            }
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
    <div class="author">
      par <PickGroup
        value={$data?.author?.uid}
        options={$dataMe?.canCreateThemesOn ?? []}
        let:open
        on:finish={async ({ detail }) => {
          if (!$data) return;
          await mutateAndToast(UpdateName, {
            theme: $data.localID,
            author: detail,
            name: $data.name,
          });
        }}
      >
        <ButtonGhost help="Changer le groupe responsable du thème" on:click={open}>
          <AvatarGroup href="" name group={$data?.author ?? null} />
        </ButtonGhost>
      </PickGroup>
    </div>
  </section>

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

  <section class="colors">
    <h2 class="typo-field-label">Couleurs</h2>
    <div class="swatches">
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
              await setValue(variable, currentTarget.value);
              await debouncedUpdateValueInAPI(variable, currentTarget.value);
            }}
          />
        </label>
      {/each}
    </div>
  </section>

  <section class="urls">
    <ModalOrDrawer narrow title="Obtenir des URLs de tes images" bind:open={openURLsHelp} let:close>
      <p>
        Pour uploader une image, tu peut utiliser une
        <a href={refroute('/groups/[uid]/edit/pages', loading($data?.author?.uid ?? '', ''))}>
          page de groupe
        </a>
        et déposer tes fichiers dessus
      </p>
      <p>
        Ensuite, après avoir upload l'image tu pourra l'ajouter à la page à l'aide du bouton
        d'insertion. Cet ajout va te générer une URL que tu peux garder et utiliser pour le thème.
      </p>
      <section class="ok">
        <ButtonPrimary on:click={close}>OK</ButtonPrimary>
      </section>
    </ModalOrDrawer>

    <h2 class="typo-field-label">
      Images <ButtonGhost on:click={openURLsHelp}>
        <IconHelp /></ButtonGhost
      >
    </h2>
    {#each urlValues(values[selectedVariant ?? 'Light']) as [variable, value]}
      <InputTextGhost
        placeholder="URL pour {variable}"
        label={DISPLAY_THEME_VARIABLE[variable]}
        {value}
        on:blur={async ({ detail }) => {
          await setValue(variable, detail);
          await debouncedUpdateValueInAPI(variable, detail);
          // Tell svelte to apply dom changes (css variable changes) before reloading theme variables
          await tick();
          forceReloadTheme();
        }}
      />
    {/each}
  </section>

  <section class="actions">
    <ButtonPrimary on:click={() => ($editingTheme = null)}>Terminé</ButtonPrimary>
    <ButtonSecondary
      danger
      on:click={async () => {
        await mutateAndToast(DeleteTheme, {
          theme: $data?.localID,
        });
        await new PageSettingsThemeStore().fetch();
        $editingTheme = null;
      }}>Supprimer</ButtonSecondary
    >
  </section>

  <div class="base-values-getter" bind:this={baseValuesGetter}>
    <div class="Dark" data-force-default-theme="dark"></div>
    <div class="Light" data-force-default-theme="light"></div>
  </div>
</article>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
    padding: 1rem;
    overflow-y: scroll;
  }

  .infos .author {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-top: 0.5rem;
  }

  .swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    margin-top: 1rem;
  }

  header {
    width: 100%;
  }

  h2 {
    display: flex;
    align-items: center;
    font-weight: bold;
  }

  .swatch input {
    display: none;
  }

  .swatch {
    width: 3rem;
    height: 3rem;
    border-radius: 10000px;
    outline: 1px solid var(--fg);
  }
</style>
