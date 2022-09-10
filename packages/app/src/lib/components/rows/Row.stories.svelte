<script lang="ts">
  import { Meta, Story } from '@storybook/addon-svelte-csf';
  import Button from '../buttons/Button.svelte';
  import Row from './Row.svelte';
</script>

<Meta title="Components/Rows/Row" component={Row} />

<Story name="Default">
  <Row>
    <strong>John Doe</strong>
    <span>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolores, distinctio?</span>
    <svelte:fragment slot="actions">
      <Button theme="primary">Edit</Button>
      <Button theme="success">Save</Button>
      <Button theme="danger">Delete</Button>
    </svelte:fragment>
  </Row>
</Story>
