<script context="module" lang="ts">
  import type { Load } from './__types'

  export const load: Load = () => ({
    status: 307,
    redirect: `01/`,
  })
</script>
