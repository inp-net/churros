<script context="module" lang="ts">
  import Card from '$lib/components/Card.svelte';

  export const meta = {
    title: 'Card',
    component: Card,
  };
</script>

<script lang="ts">
  import { Template, Story } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  <Card {...args}>Test</Card>
</Template>

<Story name="Default">
  <Card>Test</Card>
</Story>
