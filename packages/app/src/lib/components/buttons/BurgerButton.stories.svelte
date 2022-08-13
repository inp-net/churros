<script lang="ts">
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
  import BurgerButton from './BurgerButton.svelte';

  let openness = 0;
</script>

<Meta
  title="Components/Buttons/BurgerButton"
  component={BurgerButton}
  argTypes={{ onClick: { action: 'click' } }}
/>

<Template let:args>
  <BurgerButton {openness} --primary-text="tomato" on:click={args.onClick} />
  <p>
    <label class="gap-4 inline-flex items-center">
      <input type="range" bind:value={openness} min="0" max="1" step="0.0001" />
      {openness}
    </label>
  </p>
</Template>

<Story name="Default" />
