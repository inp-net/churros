<script lang="ts">
  import { Meta, Story } from '@storybook/addon-svelte-csf';
  import MajesticonsLightBulb from '~icons/majesticons/light-bulb';
  import MajesticonsRocket3Start from '~icons/majesticons/rocket-3-start';
  import FlexList from './FlexList.svelte';
</script>

<Meta title="Components/Lists/FlexList" component={FlexList} />

<Story name="Default">
  <FlexList>
    <li>
      <MajesticonsLightBulb />
      I have an idea
    </li>
    <li>
      <a href={'#'}>
        <MajesticonsRocket3Start />
        Take me to space!
      </a>
    </li>
  </FlexList>
</Story>
