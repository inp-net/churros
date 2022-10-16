<script lang="ts">
  import { Meta, Story } from '@storybook/addon-svelte-csf';
  import InlineLoader from './InlineLoader.svelte';
  import Loader from './Loader.svelte';
</script>

<Meta title="Components/Loaders/Loader" component={Loader} />

<Story name="Default">
  <div style="width: 10rem; height: 10rem;">
    <Loader />
  </div>
</Story>

<Story name="Inline" let:args>
  <InlineLoader />
</Story>
