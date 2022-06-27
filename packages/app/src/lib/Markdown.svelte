<script lang="ts">
  import MarkdownIt from "markdown-it";

  const md = new MarkdownIt();

  export let body: string;
</script>

{@html md.render(body)}
