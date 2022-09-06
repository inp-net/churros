<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;

  $: userCandidates = data.userCandidates.edges.map(({ node }) => node);
</script>

<pre>{JSON.stringify(userCandidates, undefined, 2)}</pre>
