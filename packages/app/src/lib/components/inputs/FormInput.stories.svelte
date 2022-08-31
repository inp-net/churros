<script lang="ts">
  import { Meta, Story } from '@storybook/addon-svelte-csf';
  import FormInput from './FormInput.svelte';
</script>

<Meta title="Components/Inputs/FormInput" component={FormInput} args={{ label: 'Label:' }} />

<Story name="Default" let:args>
  <FormInput {...args}>
    <input />
  </FormInput>
</Story>

<Story name="With hint" args={{ hint: 'This is a hint to help the user.' }} let:args>
  <FormInput {...args}>
    <input />
  </FormInput>
</Story>

<Story name="With errors" args={{ errors: ['First error.', 'Second error.'] }} let:args>
  <FormInput {...args}>
    <input />
  </FormInput>
</Story>
