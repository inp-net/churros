<script lang="ts">
  import { Meta, Story } from '@storybook/addon-svelte-csf';
  import MajesticonsChevronDown from '~icons/majesticons/chevron-down';
  import MajesticonsChevronUp from '~icons/majesticons/chevron-up';
  import MajesticonsClose from '~icons/majesticons/close';
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
    <MajesticonsClose />
  </GhostButton>
</Story>

<Story name="Grouped">
  <InputGroup>
    <GhostButton>
      <MajesticonsChevronUp />
    </GhostButton>
    <GhostButton>
      <MajesticonsClose />
    </GhostButton>
    <GhostButton>
      <MajesticonsChevronDown />
    </GhostButton>
  </InputGroup>
</Story>
