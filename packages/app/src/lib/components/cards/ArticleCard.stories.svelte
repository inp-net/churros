<script lang="ts">
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
  import ArticleCard from './ArticleCard.svelte';
</script>

<Meta
  title="Components/Cards/ArticleCard"
  component={ArticleCard}
  args={{
    href: '#',
    img: {
      src: 'https://picsum.photos/1200/800',
      alt: 'A beautiful picture',
      width: 1200,
      height: 800,
    },
    title: 'This is an article',
  }}
/>

<Template let:args>
  <ArticleCard {...args}>
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti unde fugiat pariatur vel
      perspiciatis eaque, <a href={'#'}>molestiae voluptatibus delectus consequatur</a> veniam animi
      excepturi! Corrupti quibusdam odit minus velit sit nemo voluptatem?
    </p>
    <h3>Other things</h3>
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate ab nisi quaerat non.
      Quisquam a sed optio, id autem at.
    </p>
  </ArticleCard>
</Template>

<Story name="Default" />
