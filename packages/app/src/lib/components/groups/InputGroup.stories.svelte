<script lang="ts">
  import { Story, Meta } from '@storybook/addon-svelte-csf';
  import Button from '../buttons/Button.svelte';
  import InputGroup from './InputGroup.svelte';
</script>

<Meta title="Components/Groups/InputGroup" component={InputGroup} />

<Story name="One">
  <InputGroup>
    <input />
  </InputGroup>
</Story>

<Story name="Two">
  <InputGroup>
    <select><option>Select</option></select>
    <input />
  </InputGroup>
</Story>

<Story name="Three">
  <InputGroup>
    <select><option>Select</option></select>
    <input />
    <Button theme="primary">Send</Button>
  </InputGroup>
</Story>
