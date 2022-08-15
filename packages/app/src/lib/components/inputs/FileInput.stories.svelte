<script lang="ts">
  import { Meta, Story } from '@storybook/addon-svelte-csf';
  import UserPicture from '../pictures/UserPicture.svelte';
  import FileInput from './FileInput.svelte';
</script>

<Meta
  title="Components/Inputs/FileInput"
  component={FileInput}
  argTypes={{ onChange: { action: 'change' } }}
/>

<Story name="Default" let:args>
  <FileInput {...args} on:change={args.onChange}>
    <UserPicture src="http://via.placeholder.com/160" alt="Placeholder" />
  </FileInput>
</Story>
