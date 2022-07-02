<script lang="ts">
  import { goto } from "$app/navigation";
  import { page, session } from "$app/stores";
  import { saveSessionToken, sessionUserQuery } from "$lib/session";
  import { mutate } from "$lib/zeus";
  import { onMount } from "svelte";

  let name = "";
  let password = "";

  /** Redirects the user if a `then` parameter exists, or to "/" otherwise. */
  const redirect = async () => {
    const then = $page.url.searchParams.get("then") ?? "/";
    if (then) {
      let url = new URL(then, $page.url);
      if (url.origin !== $page.url.origin) url = new URL("/", $page.url);
      await goto(url);
    }
  };

  const login = async () => {
    const { login } = await mutate({
      login: [
        { name, password },
        { token: true, user: sessionUserQuery() },
      ],
    });
    saveSessionToken(login.token);
    $session.token = login.token;
    $session.me = login.user;
    await redirect();
  };

  onMount(async () => {
    // Client-side redirect to avoid login detection
    if ($session.me) await redirect();
  });
</script>

<form on:submit|preventDefault={login}>
  <p><label>Username: <input type="text" bind:value={name} /></label></p>
  <p>
    <label>Password: <input type="password" bind:value={password} /></label>
  </p>
  <p><button type="submit">Login</button></p>
</form>
