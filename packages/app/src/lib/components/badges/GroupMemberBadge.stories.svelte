<script lang="ts">
  import { Story, Meta, Template } from '@storybook/addon-svelte-csf';
  import GroupMemberBadge from './GroupMemberBadge.svelte';
</script>

<Meta title="Components/Badges/GroupMemberBadge" component={GroupMemberBadge} />

<Template let:args>
  <GroupMemberBadge {...args} />
</Template>

<Story
  name="Default"
  args={{ groupMember: { group: { name: 'Group', color: '#f090b0' }, title: 'Member' } }}
/>
