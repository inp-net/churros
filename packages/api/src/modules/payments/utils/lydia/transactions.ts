import { ENV, log, prisma } from '#lib';
import type { LydiaTransaction } from '@churros/db/prisma';
import { GraphQLError } from 'graphql';
import { createHash } from 'node:crypto';

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
  if (!transaction.registration && !transaction.contribution)
    throw new Error('Transaction has no purpose');
  const beneficiary =
    transaction.registration?.ticket.event.beneficiary ??
    transaction.contribution?.option.beneficiary;
  if (!beneficiary) throw new Error('Transaction has no beneficiary');

  return {
    verified: lydiaSignature(beneficiary, signatureParams) === signature,
    transaction,
  };
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
  const res = await fetch(`${ENV.PUBLIC_LYDIA_API_URL}/api/request/state.json`, {
    method: 'POST',
    body: new URLSearchParams({
      request_id: transaction.requestId,
    }),
  });

  const response = (await res.json()) as {
    state: '0' | '1' | '5' | '6' | '-1';
  };

  const state = {
    '0': LydiaTransactionState.Pending,
    '1': LydiaTransactionState.Paid,
    '5': LydiaTransactionState.Refused,
    '6': LydiaTransactionState.OwnerCancelled,
    '-1': LydiaTransactionState.Error,
  }[response.state];

  return { state, paid: state === LydiaTransactionState.Paid };
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
    confirm_url: ENV.LYDIA_WEBHOOK_URL || '',
  };

  await log('lydia', 'request/sending', formParams, phone);

  // Send the lydia payment request
  const response = await fetch(`${ENV.PUBLIC_LYDIA_API_URL}/api/request/do.json`, {
    method: 'POST',
    body: new URLSearchParams(formParams),
  });
  if (!response.ok) throw new Error('Error while sending the payment request');
  // Retrieve the requestId and requestUuid
  const { request_id, request_uuid } = (await response.json()) as {
    request_id: string;
    request_uuid: string;
  };
  await log('lydia', 'request/sent', { request_id, request_uuid, formParams }, phone);
  return { requestId: request_id, requestUuid: request_uuid };
}
