<script lang="ts">
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import { themeDebugger } from '$lib/debugging';
  import { toasts } from '$lib/toasts';
  import { onMount } from 'svelte';
  import IconCollapse from '~icons/mdi/chevron-down';
  import IconExpand from '~icons/mdi/chevron-up';
  import IconClose from '~icons/mdi/close';
  import IconSave from '~icons/mdi/content-save';
  import IconRefresh from '~icons/mdi/refresh';
  import IconAnchorToTop from '~icons/mdi/arrow-down';
  import IconAnchorToBottom from '~icons/mdi/arrow-up';
  import { theme } from '$lib/theme';

  let colorVariables: Array<[string, string]> = [];
  let otherVariables: Array<[string, string]> = [];
  let copiedOk = false;
  let collapsed = false;
  let anchorTo: 'top' | 'bottom' = 'bottom';

  function isColorValue(value: string, name: string): boolean {
    if (name.startsWith('--nav-') && name.endsWith('-background')) return false;
    return /^(#|((rgba?|hs[lv]a?)\())/.test(value) || ['black', 'white'].includes(value);
  }

  function computeVariables() {
    colorVariables = [];
    otherVariables = [];
    const style = getComputedStyle(document.documentElement);
    for (let i = 0; i < style.length; i++) {
      const name = style[i];
      const value = style.getPropertyValue(name);
      if (name.startsWith('--')) {
        if (isColorValue(value, name)) colorVariables = [...colorVariables, [name, value]];
        else otherVariables = [...otherVariables, [name, value]];
      }
    }
    colorVariables = colorVariables.reverse();
  }

  onMount(() => {
    setTimeout(() => {
      computeVariables();
    }, 1000);
  });

  theme.subscribe(() => computeVariables());

  async function generateDeclarations() {
    const themeName = prompt('Theme name')
      ?.toLowerCase()
      .replaceAll(/[^\da-z-]/gi, '');

    const text = `
    // Code à donner à net7:

    &.${themeName}, &.${themeName}::backdrop {
      ${colorVariables.map(([name, value]) => `${name}: ${value};`).join('\n')}
    }
    `;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      copiedOk = true;
    } else {
      await toasts.error(
        'Impossible de copier',
        'Ton navigateur ne supporte pas cette fonctionnalité',
      );
    }
  }
</script>

<aside style={`${anchorTo}: 0;`}>
  <h1>
    Thème

    <div class="actions">
      <ButtonGhost darkShadow on:click={generateDeclarations}>
        <IconSave color="white"></IconSave>
      </ButtonGhost>
      <ButtonGhost darkShadow on:click={computeVariables}>
        <IconRefresh color="white"></IconRefresh>
      </ButtonGhost>
      <ButtonGhost darkShadow on:click={() => (collapsed = !collapsed)}>
        {#if (collapsed && anchorTo === 'bottom') || (!collapsed && anchorTo === 'top')}
          <IconExpand color="white"></IconExpand>
        {:else}
          <IconCollapse color="white"></IconCollapse>
        {/if}
      </ButtonGhost>
      <ButtonGhost darkShadow on:click={() => (anchorTo = anchorTo === 'top' ? 'bottom' : 'top')}>
        {#if anchorTo === 'top'}
          <IconAnchorToTop color="white"></IconAnchorToTop>
        {:else}
          <IconAnchorToBottom color="white"></IconAnchorToBottom>
        {/if}
      </ButtonGhost>
      <ButtonGhost
        darkShadow
        on:click={() => {
          $themeDebugger = false;
          toasts.info(
            'Pour réactiver le theme debugger, scroller en bas de la page Autres services.',
          );
        }}
      >
        <IconClose color="white"></IconClose>
      </ButtonGhost>
    </div>
  </h1>

  {#if !collapsed}
    {#if copiedOk}
      <p>Code copié, donne-le à net7 ;)</p>
    {/if}

    <table>
      {#each colorVariables as [name, value]}
        <tr>
          <td>{name}</td>
          <td>
            <input
              type="color"
              {name}
              id=""
              {value}
              on:input={(e) => {
                if (!(e.target instanceof HTMLInputElement)) return;
                const newValue = e.target.value;
                document.documentElement.style.setProperty(name, newValue);
                colorVariables = colorVariables.map(([n, v]) =>
                  n === name ? [n, newValue] : [n, v],
                );
              }}
            />
          </td>
        </tr>
      {:else}
        <tr>Chargement…</tr>
      {/each}
      {#each otherVariables as [name, value]}
        <tr>
          <td>{name}</td>
          <td>
            {#if /--nav-.+-background/.test(name)}
              <p class="typo-details">
                Utiliser <code>url('URL')</code> avec <code>URL</code> le lien vers une image; ou
                <code>#xxxxxx</code> un code héxa de couleur
              </p>
            {/if}
            <input
              type="text"
              {value}
              {name}
              on:input={(e) => {
                if (!(e.target instanceof HTMLInputElement)) return;
                const newValue = e.target.value;
                document.documentElement.style.setProperty(name, newValue);
                otherVariables = otherVariables.map(([n, v]) =>
                  n === name ? [n, newValue] : [n, v],
                );
              }}
            />
          </td>
        </tr>
      {/each}
    </table>
  {/if}
</aside>

<style>
  input[type='color'] {
    width: 3rem;
    height: 3rem;
  }

  h1 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1.5em;
  }

  td p {
    max-width: 10rem;
  }

  aside {
    position: fixed;
    left: 0;
    z-index: 10000000;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
    gap: 2rem;
    max-height: 60vh;
    padding: 1.5rem;
    overflow: auto;
    color: white;
    resize: both;
    background-color: black;
    box-shadow: var(--shadow-enormous);
  }
</style>
