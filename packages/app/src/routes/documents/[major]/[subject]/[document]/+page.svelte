
<script lang="ts">
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

<pre>
    {JSON.stringify(data.document, null, 2)}
</pre>
