<script lang="ts">
  import type { PageData } from './$types';
  import PostDetails from '$lib/components/FormArticle.svelte';
  import FormPicture from '$lib/components/FormPicture.svelte';

  export let data: PageData;

  const { title } = data.article;
</script>

<h1>Édition de l'article {title}</h1>

<FormPicture objectName="Article" bind:object={data.article} />
<PostDetails bind:data />
