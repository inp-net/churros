<script lang="ts">
  import { Meta, Story } from '@storybook/addon-svelte-csf';
  import IconLightBulb from '~icons/mdi/lightbulb';
  import IconRocket3Start from '~icons/mdi/rocket';
  import FlexList from './FlexList.svelte';
</script>

<Meta title="Components/Lists/FlexList" component={FlexList} />

<Story name="Default">
  <FlexList>
    <li>
      <IconLightBulb />
      I have an idea
    </li>
    <li>
      <a href={'#'}>
        <IconRocket3Start />
        Take me to space!
      </a>
    </li>
  </FlexList>
</Story>
