import { ENV } from '#lib';

// Add lydia account to a group
export async function checkLydiaAccount(vendor_token: string, vendor_id: string): Promise<void> {
  // Check if the lydia account is available
  const response = await fetch(`${ENV.PUBLIC_LYDIA_API_URL}/api/auth/vendortoken.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      vendor_token,
      vendor_id,
    }),
  });
  if (!response.ok) throw new Error('Invalid tokens');
}
