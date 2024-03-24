<div class="content">
  <h1>La Frappe</h1>
  <slot />
</div>

<style>
  h1 {
    margin-bottom: 2rem;
    text-align: center;
  }

  .content {
    width: 100%;
    max-width: 1200px;
    padding: 0 1rem;
    margin: 0 auto;
  }

  .content :global(> ul),
  .content :global(> h2),
  .content :global(> .breadcrumbs),
  .content :global(> article),
  .content :global(> div),
  .content :global(> section) {
    max-width: 800px;
    margin-right: auto;
    margin-left: auto;
  }

  .content :global(> .breadcrumbs) {
    margin-bottom: 2rem;
  }
</style>
