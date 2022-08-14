<script lang="ts">
  import { Story, Meta, Template } from '@storybook/addon-svelte-csf';
  import SchoolBadge from './SchoolBadge.svelte';
</script>

<Meta title="Components/Badges/SchoolBadge" component={SchoolBadge} />

<Template let:args>
  <SchoolBadge {...args} />
</Template>

<Story name="One" args={{ schools: [{ name: 'Lorem', color: '#ffa6fb' }] }} />

<Story
  name="Two"
  args={{
    schools: [
      { name: 'Lorem', color: '#ffa6fb' },
      { name: 'Ipsum', color: '#3c571d' },
    ],
  }}
/>
