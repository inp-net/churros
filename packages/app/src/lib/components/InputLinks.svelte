<script lang="ts">
  import IconClose from '~icons/mdi/close';
  import IconAdd from '~icons/mdi/plus';
  import IconChevronUp from '~icons/mdi/chevron-up';
  import IconChevronDown from '~icons/mdi/chevron-down';
  import IconCheck from '~icons/mdi/check';
  import IconDelete from '~icons/mdi/delete-outline';
  import GhostButton from './ButtonGhost.svelte';
  import IconEditReplacements from '~icons/mdi/file-replace-outline';
  import InputField from './InputField.svelte';
  import InputSelectOne from './InputSelectOne.svelte';

  export let label: string;
  export let required = false;
  export let hint = '';
  export let value: Array<{ name: string; value: string }> = [];
  export let newValue: { name: string; value: string } = { name: '', value: '' };
  export let computed = true;
  export let linkNotEmpty = false;

  let editingComputedLink: undefined | string;
  let replacements: Record<string, string> = {};

  function urlOrUndefined(maybeUrl: string): URL | undefined {
    try {
      return new URL(maybeUrl);
    } catch {
      return undefined;
    }
  }

  function addLink() {
    if (!/^https?:\/\//.test(newValue.value)) newValue.value = `https://${newValue.value}`;

    try {
      // eslint-disable-next-line no-new
      new URL(newValue.value);
    } catch {
      return;
    }

    value = [...value, newValue];
    newValue = { name: '', value: '' };
  }

  function handleEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      addLink();
      event.stopPropagation();
      event.preventDefault();
    }
  }

  $: newLinkBothFieldsAreFilled = newValue.name.length > 0 && newValue.value.length > 0;
  $: linkNotEmpty = value.length > 0;

  function newLinkHandleBlur() {
    if (newLinkBothFieldsAreFilled) addLink();
  }
</script>

<InputField {label} {required} {hint}>
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div class="links-input" on:keypress={handleEnter} role="listitem">
    <ul class="links" style:display={value.length > 0 ? 'block' : 'none'}>
      {#each value as link, i}
        {@const url = urlOrUndefined(link.value)}
        <li class="link">
          <div class="link-and-actions">
            <div class="order action-button">
              {#if i > 0}
                <GhostButton
                  title="Remonter"
                  on:click={() => {
                    value = [
                      ...value.slice(0, i - 1),
                      value[i],
                      value[i - 1],
                      ...value.slice(i + 1),
                    ];
                  }}
                >
                  <IconChevronUp aria-label="Remonter" />
                </GhostButton>
              {/if}
              {#if i < value.length - 1}
                <GhostButton
                  title="Descendre"
                  on:click={() => {
                    value = [...value.slice(0, i), value[i + 1], value[i], ...value.slice(i + 2)];
                  }}
                >
                  <IconChevronDown aria-label="Descendre" />
                </GhostButton>
              {/if}
            </div>
            <div class="inputs">
              <input required placeholder="Nom de l'action" bind:value={link.name} />
              <input
                type="url"
                pattern="^https?\:\/\/.+\..+"
                placeholder="Adresse du site"
                bind:value={link.value}
              />
            </div>

            {#if computed && url?.hostname === 'docs.google.com' && url?.pathname.startsWith('/forms')}
              <div class="action-button manage-replacements">
                {#if editingComputedLink === link.name}
                  <GhostButton
                    title="Terminé"
                    on:click={() => {
                      for (const [key] of Object.entries(replacements))
                        url.searchParams.delete(key);

                      link.value =
                        url.toString() +
                        '&' +
                        Object.entries(replacements)
                          .map(([key, replacement]) => `${key}=[${replacement}]`)
                          .join('&');
                      replacements = {};
                      editingComputedLink = undefined;
                    }}
                  >
                    <IconCheck />
                  </GhostButton>
                {:else}
                  <GhostButton
                    title="Modifier les remplacements"
                    on:click={() => {
                      for (const [key, value] of url.searchParams) {
                        if (/^\[.*]$/.test(value))
                          replacements[key] = value.replaceAll(/^\[|]$/g, '');
                      }

                      editingComputedLink = link.name;
                    }}
                  >
                    <IconEditReplacements aria-label="Modifier les remplacements" />
                  </GhostButton>
                {/if}
              </div>
            {/if}
            <div class="action-button delete">
              {#if editingComputedLink === link.name}
                <GhostButton
                  title="Annuler"
                  on:click={() => {
                    editingComputedLink = undefined;
                    replacements = {};
                  }}
                >
                  <IconClose aria-label="Annuler" />
                </GhostButton>
              {:else}
                <GhostButton
                  title="Supprimer"
                  on:click={() => {
                    value = value.filter((_, j) => i !== j);
                  }}
                >
                  <IconDelete aria-label="Supprimer" />
                </GhostButton>
              {/if}
            </div>
          </div>
          {#if editingComputedLink === link.name && url}
            {@const params = [...url.searchParams]}
            <ul class="replacements nobullet">
              {#each params.filter(([key]) => key.startsWith('entry.')) as [key, value] (key)}
                <li>
                  <InputSelectOne
                    bind:value={replacements[key]}
                    options={{
                      prenom: 'Prénom',
                      nom: 'Nom de famille',
                      filiere: 'Filière',
                      uid: 'Identifiant',
                      promo: 'Promo',
                      annee: 'Année',
                    }}
                    label="Remplacer {value} par"
                  />
                </li>
              {/each}
            </ul>
          {/if}
        </li>
      {/each}
    </ul>

    <div class="new">
      <div class="inputs">
        <input
          type="text"
          on:blur={newLinkHandleBlur}
          bind:value={newValue.name}
          placeholder="Nom de l'action"
        />
        <input
          type="text"
          on:blur={newLinkHandleBlur}
          bind:value={newValue.value}
          placeholder="Adresse du site"
        />
      </div>
      <div class="add action-button">
        <GhostButton title="Ajouter" on:click={addLink}>
          <IconAdd aria-label="Ajouter" />
        </GhostButton>
      </div>
    </div>
  </div>
</InputField>

<style>
  .links-input {
    display: flex;
    flex-flow: column wrap;
    gap: 0.75rem;
  }

  ul.links {
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;
    padding-left: 0;
    list-style: none;
    border: var(--border-block) solid var(--border);
    border-radius: var(--radius-block);
  }

  .new,
  li .link-and-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    width: 100%;
    padding: 0.25rem 0.5rem;
  }

  li .replacements {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 1rem;
  }

  .order {
    display: flex;
    flex-direction: column;
  }

  .action-button {
    flex-shrink: 0;
  }

  li.link {
    border-bottom: var(--border-block) solid var(--border);
  }

  li.link:last-of-type {
    border-bottom: none;
  }

  .inputs {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .inputs input {
    padding: 0.25rem 0;
    color: var(--text);
    background: transparent;
    border: none;
  }

  .inputs input:first-child {
    border-bottom: var(--border-block) solid var(--muted-border);
  }

  .new {
    display: flex;
    border: var(--border-block) solid var(--border);
    border-radius: var(--radius-block);
  }
</style>
