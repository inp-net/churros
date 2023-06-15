import slug from 'slug';
import { prisma } from '../prisma.js';
import crypto from 'node:crypto';

// Get the Lydia API URL from the environment
const {LYDIA_API_URL} = process.env;
const LYDIA_WEBHOOK_URL: string =
  process.env['LYDIA_WEBHOOK_URL'] ?? 'http://localhost:5173/lydia-webhook';

// Retrieve lydia tokens from a user using their phone number and password
export async function getLydiaTokens(phone: string, password: string): Promise<string[]> {
  const response = await fetch(`${LYDIA_API_URL}/api/auth/login.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone,
      password,
    }),
  });
  if (!response.ok) throw new Error('Invalid credentials');
  // Parse the response
  const { business_list } = (await response.json()) as { business_list: string[] };
  // Return list of tokens
  return business_list;
}

// Add lydia account to a group
export async function addLydiaAccount(
  name: string,
  vendor_token: string,
  vendor_id: string,
  groupUid: string,
  userId: string
): Promise<void> {
  // Check if the user is a president or treasurer of the group
  // Get the group and the member and the lydia account
  const group = await prisma.group.findUnique({
    where: { uid: groupUid },
    include: {
      members: {
        where: { memberId: userId },
      },
      lyiaAccounts: true,
    },
  });
  if (!group) throw new Error('Group not found');
  const member = group.members.find((member) => member.memberId === userId);
  if (!member) throw new Error('User not found');
  if (!member.president && !member.treasurer)
    throw new Error('User is not a president or treasurer of the group');
  // Check if the lydia account already exists
  if (group.lyiaAccounts.some((account) => account.vendorToken === vendor_token))
    throw new Error('Lydia account already exists');
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
  // Create the lydia account
  await prisma.lydiaAccount.create({
    data: {
      uid: slug(name),
      name,
      group: { connect: { uid: groupUid } },
      privateToken: vendor_id,
      vendorToken: vendor_token,
    },
  });
}

// Send a payment request to a number
export async function sendLydiaPaymentRequest(
  phone: string,
  registrationId: string
): Promise<void> {
  // Get the lydia tokens from the registration
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

  // TODO: Check if their is place left
  // TODO: Check if the user has already paid
  // Cancel the previous transaction
  if (transaction.requestId && transaction.requestUuid) {
    // Cancel the previous transaction
    await fetch(`${LYDIA_API_URL}/api/request/cancel.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        request_id: transaction.requestId,
        vendor_token: registration.ticket.event.beneficiary?.vendorToken,
      }),
    });
  }

  // Send the lydia payment request
  const response = await fetch(`${LYDIA_API_URL}/api/request/do.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Paiement de ${registration.ticket.event.title}`,
      amount: registration.ticket.price,
      cuurency: 'EUR',
      type: 'phone',
      recipient: phone,
      vendor_token: registration.ticket.event.beneficiary?.vendorToken,
      confirm_url: LYDIA_WEBHOOK_URL,
    }),
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

interface Param {
  transaction_identifier: string;
  amount: string;
}

// Create lydia signature
const createLydiaSignature = (requestId: string, amount: number, privateToken: string): string => {
  const param: Param = {
    transaction_identifier: requestId,
    amount: amount.toString(),
  };

  const sortedKeys = Object.keys(param).sort();

  const sig = sortedKeys.map((key) => `${key}=${param[key as keyof Param]}`);

  const concatenatedSig = sig.join('&');
  const callSig = crypto
    .createHash('md5')
    .update(concatenatedSig + '&' + privateToken)
    .digest('hex');

  return callSig;
};
