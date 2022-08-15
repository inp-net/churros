<script lang="ts">
  import { Story, Meta, Template } from '@storybook/addon-svelte-csf';
  import SchoolBadge from './SchoolBadge.svelte';
</script>

<Meta title="Components/Badges/SchoolBadge" component={SchoolBadge} />

<Template let:args>
  <SchoolBadge {...args} />
</Template>

<Story name="One" args={{ schools: [{ name: 'Lorem', color: '#f090b0' }] }} />

<Story
  name="Two"
  args={{
    schools: [
      { name: 'Lorem', color: '#f090b0' },
      { name: 'Ipsum', color: '#70f030' },
    ],
  }}
/>

<Story
  name="Three"
  args={{
    schools: [
      { name: 'Lorem', color: '#f090b0' },
      { name: 'Ipsum', color: '#70f030' },
      { name: 'Dolor', color: '#4060f0' },
    ],
  }}
/>
