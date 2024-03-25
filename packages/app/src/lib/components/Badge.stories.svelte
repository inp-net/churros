<script lang="ts" context="module">
  import Badge from '$lib/components/Badge.svelte';

  export const meta = {
    title: 'Badge',
    component: Badge,
  };
</script>

<script lang="ts">
  import { Template, Story } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  <Badge {...args}>Your content here</Badge>
</Template>

<Story name="Default">
  <Badge>Test</Badge>
</Story>
