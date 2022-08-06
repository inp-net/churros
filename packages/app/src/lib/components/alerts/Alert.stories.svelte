<script lang="ts">
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
  import Alert from './Alert.svelte';

  let closed = false;
</script>

<Meta title="Components/Alerts/Alert" component={Alert} args={{ theme: 'default' }} />

<Template let:args>
  <p><label><input type="checkbox" bind:checked={closed} /> Closed</label></p>
  <Alert {...args} {closed}>
    <h3>Title</h3>
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti unde fugiat pariatur vel
      perspiciatis eaque, <a href={'#'}>molestiae voluptatibus delectus consequatur</a> veniam animi
      excepturi! Corrupti quibusdam odit minus velit sit nemo voluptatem?
    </p>
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate ab nisi quaerat non.
      Quisquam a sed optio, id autem at.
    </p>
  </Alert>
  <Alert {...args} {closed} inline>Inline alert</Alert>
</Template>

<Story name="Default" />
<Story name="Primary" args={{ theme: 'primary' }} />
<Story name="Success" args={{ theme: 'success' }} />
<Story name="Danger" args={{ theme: 'danger' }} />
<Story name="Warning" args={{ theme: 'warning' }} />
