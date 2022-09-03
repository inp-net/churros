<script lang="ts">
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
  import Alert from '../alerts/Alert.svelte';
  import Button from '../buttons/Button.svelte';
  import FormCard from './FormCard.svelte';

  let loading = false;
  let error = false;
</script>

<Meta
  title="Components/Cards/FormCard"
  component={FormCard}
  args={{ title: 'Title', large: false }}
  argTypes={{ onSubmit: { action: 'submit' } }}
/>

<Template let:args>
  <FormCard
    {...args}
    on:submit={(event) => {
      args.onSubmit(event);
      loading = true;
      error = false;
      setTimeout(() => {
        loading = false;
        error = true;
      }, 2000);
    }}
  >
    <Alert theme="danger" closed={!error} inline>Incorrect credentials.</Alert>
    <p><label>Email address: <input type="email" /></label></p>
    <p>
      <label>Password: <input type="password" /></label>
    </p>
    <p class="text-center">
      <Button type="submit" theme="primary" {loading}>Login</Button>
    </p>
    <svelte:fragment slot="footer">
      <a href={'#'}>Password forgotten</a> •
      <a href={'#'}>Register</a>
    </svelte:fragment>
  </FormCard>
</Template>

<Story name="Default" />
<Story name="Large" args={{ large: true }} />

<style lang="scss">
  input {
    display: block;
    width: 100%;
  }
</style>
