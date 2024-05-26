import { ApiV5Client as HelloAsso } from 'helloasso';

export const client = new HelloAsso({
  apiBase: 'api.helloasso.com',
  clientId: process.env.PUBLIC_HELLOASSO_CLIENT_ID,
  clientSecret: process.env.HELLOASSO_CLIENT_SECRET,
});

/**
 * Returns slug of the first HelloAsso organization
 */
export async function defaultOrganization(): Promise<string> {
  const organizations = await client.call('/v5/users/me/organizations').then((r) => r.json());
  return organizations[0]!.organizationSlug;
}
