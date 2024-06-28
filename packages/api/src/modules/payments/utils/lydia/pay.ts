import { prisma } from '#lib';
import type { LydiaAccount, LydiaTransaction, ShopItem, ShopPayment } from '@churros/db/prisma';
import { GraphQLError } from 'graphql';
import {
  LydiaTransactionState,
  checkLydiaTransaction,
  priceWithPromotionsApplied,
  sendLydiaPaymentRequest,
} from '../../index.js';

// Get the Lydia API URL from the environment
const { PUBLIC_LYDIA_API_URL } = process.env;

// Send a payment request to a number
export async function payEventRegistrationViaLydia(
  phone: string,
  registrationId?: string,
): Promise<void> {
  // Get the lydia tokens from the registration
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: {
      author: true,
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
    await priceWithPromotionsApplied(registration.ticket, registration.author ?? undefined),
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
