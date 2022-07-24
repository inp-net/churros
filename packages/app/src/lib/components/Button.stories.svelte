<script lang="ts">
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
  import Button from './Button.svelte';
</script>

<Meta title="Components/Button" component={Button} args={{ type: 'button', theme: 'default' }} />

<Template let:args>
  <Button {...args}>Button</Button>
  <Button {...args} disabled>Disabled</Button>
</Template>

<Story name="Default" />
<Story name="Primary" args={{ theme: 'primary' }} />
<Story name="Success" args={{ theme: 'success' }} />
<Story name="Danger" args={{ theme: 'danger' }} />
<Story name="Warning" args={{ theme: 'warning' }} />
