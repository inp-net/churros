<script lang="ts">
  import type { PageData } from './$types';
  import PostDetails from './PostDetails.svelte';
  import PostPicture from './PostPicture.svelte';

  export let data: PageData;

  const { title } = data.article;
</script>

<h1>Édition de l'article {title}</h1>

<PostPicture bind:article={data.article} />
<PostDetails bind:data />
