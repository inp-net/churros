<script lang="ts">
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
  import Card from './Card.svelte';
</script>

<Meta title="Components/Cards/Card" component={Card} args={{}} />

<Template let:args>
  <Card {...args}>
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
  </Card>
</Template>

<Story name="Default" />
