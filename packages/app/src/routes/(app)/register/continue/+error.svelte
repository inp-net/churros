<script>
  import { env } from '$env/dynamic/public';
  import Alert from '$lib/components/Alert.svelte';
</script>

<Alert theme="danger">
  <h3>Cette inscription a expiré.</h3>
  <p>
    Vous pouvez <a href="..">recommencer votre inscription</a> ou
    <a href="mailto:{env.PUBLIC_SUPPORT_EMAIL}">contacter le support</a>.
  </p>
</Alert>
