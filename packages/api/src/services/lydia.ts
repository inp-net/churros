import { prisma } from '../prisma.js';
import { createHash } from 'node:crypto';

// Get the Lydia API URL from the environment
const { LYDIA_API_URL, LYDIA_WEBHOOK_URL } = process.env;

// Add lydia account to a group
export async function checkLydiaAccount(vendor_token: string, vendor_id: string): Promise<void> {
  // Check if the lydia account is available
  const response = await fetch(`${LYDIA_API_URL}/api/auth/vendortoken.json`, {
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

// Send a payment request to a number
export async function sendLydiaPaymentRequest(
  phone: string,
  registrationId?: string
): Promise<void> {
  // Get the lydia tokens from the registration
  console.log(registrationId);
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: {
      ticket: {
        include: {
          event: {
            include: {
              beneficiary: true,
            },
          },
        },
      },
      lydiaTransaction: true,
    },
  });
  console.log(registration);
  if (!registration) throw new Error('Registration not found');
  let transaction = registration.lydiaTransaction;
  // Check if a lydia transaction already exists
  if (!transaction) {
    // Create a lydia transaction
    transaction = await prisma.lydiaTransaction.create({
      data: {
        registration: { connect: { id: registrationId } },
        phoneNumber: phone,
      },
    });
  }

  // Cancel the previous transaction
  if (transaction.requestId && transaction.requestUuid) {
    // Cancel the previous transaction
    await fetch(`${LYDIA_API_URL}/api/request/cancel.json`, {
      method: 'POST',
      body: new URLSearchParams({
        request_id: transaction.requestId,
        vendor_token: registration.ticket.event.beneficiary?.vendorToken || '',
      }),
    });
  }

  const formParams = {
    message: `Paiement de ${registration.ticket.event.title}`,
    amount: registration.ticket.price.toString(),
    currency: 'EUR',
    type: 'phone',
    recipient: phone,
    vendor_token: registration.ticket.event.beneficiary?.vendorToken || '',
    confirm_url: LYDIA_WEBHOOK_URL || '',
  };

  // Send the lydia payment request
  const response = await fetch(`${LYDIA_API_URL}/api/request/do.json`, {
    method: 'POST',
    body: new URLSearchParams(formParams),
  });
  if (!response.ok) throw new Error('Error while sending the payment request');
  // Retrieve the requestId and requestUuid
  const { request_id, request_uuid } = (await response.json()) as {
    request_id: string;
    request_uuid: string;
  };
  // Update the lydia transaction
  await prisma.lydiaTransaction.update({
    where: { id: transaction.id },
    data: {
      phoneNumber: phone,
      requestId: request_id,
      requestUuid: request_uuid,
    },
  });
}

export function lydiaSignature(
  { privateToken }: { privateToken: string },
  params: Record<string, string>
): string {
  return createHash('md5')
    .update(
      new URLSearchParams(
        Object.keys(params)
          .sort()
          .map((key) => [key, params[key]!])
      ).toString() +
        '&' +
        privateToken
    )
    .digest('hex');
}
