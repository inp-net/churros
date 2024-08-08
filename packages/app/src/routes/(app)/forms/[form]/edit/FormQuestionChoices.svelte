<script lang="ts">
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import InputSelectOne from '$lib/components/InputSelectOne.svelte';
  import InputSelectOneRadios from '$lib/components/InputSelectOneRadios.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import IconMoveDown from '~icons/mdi/arrow-down';
  import IconMoveUp from '~icons/mdi/arrow-up';
  import IconDelete from '~icons/mdi/close';

  export let options: string[];
  export let __typename: 'QuestionSelectOne' | 'QuestionSelectMultiple';
  let newOption = '';

  function move(choice: string, indexDelta: number) {
    const index = options.indexOf(choice);
    if (index === -1) return;
    const newIndex = index + indexDelta;
    if (newIndex < 0 || newIndex >= options.length) return;
    options = [...options];
    options.splice(index, 1);
    options.splice(newIndex, 0, choice);
  }
</script>

<h3>
  Choix possibles

  <InputSelectOne
    options={{
      QuestionSelectOne: 'Choix unique',
      QuestionSelectMultiple: 'Cases à cocher',
    }}
    label=""
    bind:value={__typename}
  ></InputSelectOne>
</h3>
<ul class="nobullet">
  {#each options as option}
    <li class="option">
      <div class="fake-input">
        {#if __typename === 'QuestionSelectMultiple'}
          <InputCheckbox value={false} label="" disabled></InputCheckbox>
        {:else}
          <InputSelectOneRadios required options={['']} label="" disabled></InputSelectOneRadios>
        {/if}
      </div>
      <InputText label="" value={option} />
      <div class="actions">
        <ButtonGhost
          on:click={() => {
            options = options.filter((o) => o !== option);
          }}
          help="Supprimer"
        >
          <IconDelete></IconDelete>
        </ButtonGhost>
        <ButtonGhost
          on:click={() => {
            move(option, -1);
          }}
          help="Monter"
          disabled={options.indexOf(option) === 0}
        >
          <IconMoveUp></IconMoveUp>
        </ButtonGhost>
        <ButtonGhost
          on:click={() => {
            move(option, +1);
          }}
          help="Descendre"
          disabled={options.indexOf(option) === options.length - 1}
        >
          <IconMoveDown></IconMoveDown>
        </ButtonGhost>
      </div>
      <div class="jump">
        <!-- <InputSelectOne options={sections} label="Aller à la section"></InputSelectOne> -->
      </div>
    </li>
  {/each}
  <li class="option new">
    <div class="fake-input"></div>
    <InputText
      on:blur={() => {
        if (newOption && !options.includes(newOption)) {
          options = [...options, newOption];
          newOption = '';
        }
      }}
      bind:value={newOption}
      label=""
      placeholder="Nouvelle option"
    />
  </li>
</ul>

<style>
  h3 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5em;
  }

  .fake-input {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
  }

  ul {
    display: flex;
    flex-direction: column;
    row-gap: 0.5em;
  }

  .option {
    column-gap: 0.5em;
  }

  .option,
  .option .actions {
    display: flex;
    align-items: center;
  }
</style>
