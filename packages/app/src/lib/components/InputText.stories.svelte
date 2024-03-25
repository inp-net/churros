<script context="module" lang="ts">
  import InputText from '$lib/components/InputText.svelte';

  export const meta = {
    title: 'InputText',
    component: InputText,
  };
</script>

<script lang="ts">
  import { Template, Story } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  <InputText {...args}>Your content here</InputText>
</Template>

<Story name="Default">
  <InputText value="" label="Test" />
</Story>
