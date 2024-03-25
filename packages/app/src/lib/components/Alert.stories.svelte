<script lang="ts" context="module">
  import Alert from '$lib/components/Alert.svelte';

  export const meta = {
    title: 'Alert',
    component: Alert,
  };
</script>

<script lang="ts">
  import { Template, Story } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  <Alert {...args}>Your content here</Alert>
</Template>

<Story name="Default" args={{ theme: 'default' }}>
  <Alert theme="default" />
</Story>
