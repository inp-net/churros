<script lang="ts">
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import UserPicture from './UserPicture.svelte';
</script>

<Meta
  title="Components/Pictures/UserPicture"
  component={UserPicture}
  args={{ src: 'https://picsum.photos/160', alt: 'User picture', width: 160, height: 160 }}
/>
<Template let:args>
  <UserPicture {...args} />
</Template>

<Story name="Default" />
