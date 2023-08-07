<script lang="ts">
  import IconClose from '~icons/mdi/close';
  import IconAdd from '~icons/mdi/plus';
  import IconChevronUp from '~icons/mdi/chevron-up';
  import IconChevronDown from '~icons/mdi/chevron-down';
  import GhostButton from './ButtonGhost.svelte';
  import InputField from './InputField.svelte';

  export let label: string;
  export let required = false;
  export let hint = '';
  export let value: Array<{ name: string; value: string }> = [];
  export let newValue: { name: string; value: string } = { name: '', value: '' };

  function addLink() {
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
</script>

<InputField {label} {required} {hint}>
  <div class="links-input" on:keypress={handleEnter}>
    <ul style:display={value.length > 0 ? 'block' : 'none'}>
      {#each value as link, i}
        <li>
          <div class="order">
            {#if i > 0}
              <GhostButton
                title="Remonter"
                on:click={() => {
                  value = [...value.slice(0, i - 1), value[i], value[i - 1], ...value.slice(i + 1)];
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
            <input placeholder="Nom de l'action" bind:value={link.name} />
            <input placeholder="Adresse du site" bind:value={link.value} />
          </div>
          <div class="delete">
            <GhostButton
              title="Supprimer"
              on:click={() => {
                value = value.filter((_, j) => i !== j);
              }}
            >
              <IconClose aria-label="Supprimer" />
            </GhostButton>
          </div>
        </li>
      {/each}
    </ul>

    <div class="new">
      <div class="inputs">
        <input type="text" bind:value={newValue.name} placeholder="Nom de l'action" />
        <input type="text" bind:value={newValue.value} placeholder="Adresse du site" />
      </div>
      <div class="add">
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

  ul {
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
  li {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    width: 100%;
    padding: 0.25rem 0.5rem;
  }

  .order {
    display: flex;
    flex-direction: column;
  }

  .order,
  .delete,
  .add {
    flex-shrink: 0;
  }

  li {
    border-bottom: var(--border-block) solid var(--border);
  }

  li:last-of-type {
    border-bottom: none;
  }

  .inputs {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .inputs input {
    padding: 0.25rem 0;
    background: transparent;
    border: none;
  }

  .new {
    display: flex;
    border: var(--border-block) solid var(--border);
    border-radius: var(--radius-block);
  }
</style>
