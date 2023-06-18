<script lang="ts">
  import { Meta, Story } from '@storybook/addon-svelte-csf';
  import IconChevronDown from '~icons/mdi/chevron-down';
  import IconChevronUp from '~icons/mdi/chevron-up';
  import IconClose from '~icons/mdi/close';
  import InputGroup from '../groups/InputGroup.svelte';
  import GhostButton from './GhostButton.svelte';
</script>

<Meta
  title="Components/Buttons/GhostButton"
  component={GhostButton}
  argTypes={{ onClick: { action: 'click' } }}
/>

<Story name="Default" let:args>
  <GhostButton on:click={args.onClick}>
    <IconClose />
  </GhostButton>
</Story>

<Story name="Grouped">
  <InputGroup>
    <GhostButton>
      <IconChevronUp />
    </GhostButton>
    <GhostButton>
      <IconClose />
    </GhostButton>
    <GhostButton>
      <IconChevronDown />
    </GhostButton>
  </InputGroup>
</Story>
