/* eslint-disable no-console */
import { prisma } from '#lib';
import { GraphQLError } from 'graphql';
import { createHash } from 'node:crypto';
import type { LydiaAccount, LydiaTransaction, ShopItem, ShopPayment } from '@prisma/client';

// Get the Lydia API URL from the environment
const { PUBLIC_LYDIA_API_URL, LYDIA_WEBHOOK_URL } = process.env;

// Add lydia account to a group
export async function checkLydiaAccount(vendor_token: string, vendor_id: string): Promise<void> {
  // Check if the lydia account is available
  const response = await fetch(`${PUBLIC_LYDIA_API_URL}/api/auth/vendortoken.json`, {
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
export async function payEventRegistrationViaLydia(
  phone: string,
  registrationId?: string,
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
  const beneficiaryVendorToken = registration.ticket.event.beneficiary?.vendorToken;
  if (!beneficiaryVendorToken) throw new GraphQLError("L'évènement n'a pas de bénéficiaire");

  // Check if transaction was already paid for, in that case mark registration as paid
  if (registration.lydiaTransaction?.requestId && registration.lydiaTransaction.requestUuid) {
    const state = await checkLydiaTransaction(registration.lydiaTransaction);
    if (state === LydiaTransactionState.Paid) {
      await prisma.logEntry.create({
        data: {
          action: 'fallback mark as paid',
          area: 'lydia',
          message: 'Transaction was already paid for, marking registration as paid',
          target: registration.id,
        },
      });
      await prisma.registration.update({
        where: { id: registrationId },
        data: {
          paid: true,
        },
      });
      return;
    }
  }

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
    await cancelLydiaTransaction(transaction, beneficiaryVendorToken);
  }

  const requestDetails = await sendLydiaPaymentRequest(
    registration.ticket.event.title,
    registration.ticket.price,
    phone,
    beneficiaryVendorToken,
  );

  // Update the lydia transaction
  await prisma.lydiaTransaction.update({
    where: { id: transaction.id },
    data: {
      phoneNumber: phone,
      ...requestDetails,
    },
  });
}

// Send a payment request to a number
export async function payShopPaymentViaLydia(
  phone: string,
  shopPayment: ShopPayment & {
    shopItem: ShopItem & { lydiaAccount: LydiaAccount | null };
    lydiaTransaction: LydiaTransaction | null;
  },
): Promise<void> {
  if (!shopPayment.shopItem.lydiaAccount) throw new Error('Lydia account not found');
  // Check if transaction was already paid for, in that case mark registration as paid
  if (shopPayment.lydiaTransaction?.requestId && shopPayment.lydiaTransaction.requestUuid) {
    const state = await checkLydiaTransaction(shopPayment.lydiaTransaction);
    if (state === LydiaTransactionState.Paid) {
      await prisma.logEntry.create({
        data: {
          action: 'fallback mark as paid',
          area: 'lydia',
          message: 'Transaction was already paid for, marking registration as paid',
          target: shopPayment.id,
        },
      });
      await prisma.shopPayment.update({
        where: { id: shopPayment.id },
        data: {
          paid: true,
        },
      });
      return;
    }
  }

  let transaction = shopPayment.lydiaTransaction;
  // Check if a lydia transaction already exists
  if (!transaction) {
    // Create a lydia transaction
    transaction = await prisma.lydiaTransaction.create({
      data: {
        shopPayment: { connect: { id: shopPayment.id } },
        phoneNumber: phone,
      },
    });
  }

  // Cancel the previous transaction
  if (transaction.requestId && transaction.requestUuid) {
    // Cancel the previous transaction
    await cancelLydiaTransaction(transaction, shopPayment.shopItem.lydiaAccount.vendorToken);
  }

  const requestDetails = await sendLydiaPaymentRequest(
    shopPayment.shopItem.name,
    shopPayment.shopItem.price * shopPayment.quantity,
    phone,
    shopPayment.shopItem.lydiaAccount.vendorToken,
  );

  // Update the lydia transaction
  await prisma.lydiaTransaction.update({
    where: { id: transaction.id },
    data: {
      phoneNumber: phone,
      ...requestDetails,
    },
  });
}

export async function cancelLydiaTransaction(transaction: LydiaTransaction, vendorToken: string) {
  if (!transaction.requestId)
    throw new GraphQLError("Aucune requête pour cette transaction, impossible de l'annuler");
  await fetch(`${PUBLIC_LYDIA_API_URL}/api/request/cancel.json`, {
    method: 'POST',
    body: new URLSearchParams({
      request_id: transaction.requestId,
      vendor_token: vendorToken,
    }),
  });
}

export enum LydiaTransactionState {
  Paid,
  Pending,
  Refused,
  OwnerCancelled,
  Error,
}

export async function checkLydiaTransaction(transaction: LydiaTransaction) {
  if (!transaction.requestId)
    throw new GraphQLError('Aucune requête pour cette transaction, impossible de checker');
  const res = await fetch(`${PUBLIC_LYDIA_API_URL}/api/request/state.json`, {
    method: 'POST',
    body: new URLSearchParams({
      request_id: transaction.requestId,
    }),
  });

  const response = (await res.json()) as {
    state: '0' | '1' | '5' | '6' | '-1';
  };

  return {
    '0': LydiaTransactionState.Pending,
    '1': LydiaTransactionState.Paid,
    '5': LydiaTransactionState.Refused,
    '6': LydiaTransactionState.OwnerCancelled,
    '-1': LydiaTransactionState.Error,
  }[response.state];
}

export async function sendLydiaPaymentRequest(
  title: string,
  price: number,
  phone: string,
  vendorToken: string,
): Promise<{ requestId: string; requestUuid: string }> {
  const formParams = {
    message: title,
    amount: price.toString(),
    currency: 'EUR',
    type: 'phone',
    recipient: phone,
    vendor_token: vendorToken,
    confirm_url: LYDIA_WEBHOOK_URL || '',
  };

  // Send the lydia payment request
  const response = await fetch(`${PUBLIC_LYDIA_API_URL}/api/request/do.json`, {
    method: 'POST',
    body: new URLSearchParams(formParams),
  });
  if (!response.ok) throw new Error('Error while sending the payment request');
  // Retrieve the requestId and requestUuid
  const { request_id, request_uuid } = (await response.json()) as {
    request_id: string;
    request_uuid: string;
  };
  return { requestId: request_id, requestUuid: request_uuid };
}

export function lydiaSignature(
  { privateToken }: { privateToken: string },
  params: Record<string, string>,
): string {
  return createHash('md5')
    .update(
      new URLSearchParams(
        Object.keys(params)
          .sort()
          .map((key) => [key, params[key]!]),
      ).toString() +
        '&' +
        privateToken,
    )
    .digest('hex');
}

export async function verifyLydiaTransaction(
  requestId: string,
  signatureParams: Record<string, string>,
  signature: string,
): Promise<{ verified: boolean; transaction: typeof transaction }> {
  const transaction = await prisma.lydiaTransaction.findFirst({
    where: { requestId },
    include: {
      registration: {
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
        },
      },
      shopPayment: {
        include: {
          shopItem: {
            include: {
              lydiaAccount: true,
            },
          },
        },
      },
      contribution: {
        include: {
          user: true,
          option: {
            include: {
              beneficiary: true,
            },
          },
        },
      },
    },
  });
  if (!transaction) throw new Error('Transaction not found');
  if (!transaction.registration && !transaction.contribution && !transaction.shopPayment)
    throw new Error('Transaction has no purpose');
  const beneficiary =
    transaction.registration?.ticket.event.beneficiary ??
    transaction.contribution?.option.beneficiary ??
    transaction.shopPayment?.shopItem.lydiaAccount;
  if (!beneficiary) throw new Error('Transaction has no beneficiary');

  return {
    verified: lydiaSignature(beneficiary, signatureParams) === signature,
    transaction,
  };
}