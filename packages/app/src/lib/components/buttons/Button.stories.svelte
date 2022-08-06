<script lang="ts">
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
  import Button from './Button.svelte';
</script>

<Meta
  title="Components/Buttons/Button"
  component={Button}
  args={{ type: 'button', theme: 'default', disabled: false, loading: false }}
  argTypes={{ onClick: { action: 'click' } }}
/>

<Template let:args>
  <Button {...args} on:click={args.onClick}>Button</Button>
  <Button {...args} disabled on:click={args.onClick}>Disabled</Button>
  <Button {...args} loading on:click={args.onClick}>Loading</Button>
</Template>

<Story name="Default" />
<Story name="Primary" args={{ theme: 'primary' }} />
<Story name="Success" args={{ theme: 'success' }} />
<Story name="Danger" args={{ theme: 'danger' }} />
<Story name="Warning" args={{ theme: 'warning' }} />
