<script lang="ts">
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
  import Alert from './Alert.svelte';
</script>

<Meta title="Components/Alert" component={Alert} args={{ theme: 'default' }} />

<Template let:args>
  <Alert {...args}>
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
</Template>

<Story name="Default" />
<Story name="Primary" args={{ theme: 'primary' }} />
<Story name="Success" args={{ theme: 'success' }} />
<Story name="Danger" args={{ theme: 'danger' }} />
<Story name="Warning" args={{ theme: 'warning' }} />
