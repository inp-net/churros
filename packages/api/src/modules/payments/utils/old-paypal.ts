import { PayPalTransactionStatus } from '@prisma/client';
import { prisma } from '../lib/index.js';
import { log } from '../objects/logs.js';

const { PUBLIC_PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PUBLIC_PAYPAL_API_BASE_URL } = process.env;

async function accessToken() {
  const response = await fetch(new URL(`/v1/oauth2/token`, PUBLIC_PAYPAL_API_BASE_URL), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(
        `${PUBLIC_PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`,
      ).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  }).catch((error) => {
    console.error(
      `Error while getting paypal access token: ${error}, secret=${PAYPAL_CLIENT_SECRET} && id=${PUBLIC_PAYPAL_CLIENT_ID}`,
    );
    throw error;
  });
  const { access_token } = (await response.json()) as { access_token: string };
  return access_token;
}

async function initiatePaypalPayment(
  title: string,
  price: number,
  referenceId: string,
): Promise<string> {
  console.info(
    `Initiating paypal payment with ref ${referenceId}, baseurl ${PUBLIC_PAYPAL_API_BASE_URL}`,
  );
  const response = await fetch(new URL('/v2/checkout/orders', PUBLIC_PAYPAL_API_BASE_URL), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await accessToken()}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      application_context: {
        shipping_preference: 'NO_SHIPPING',
      },
      purchase_units: [
        {
          amount: {
            reference_id: referenceId,
            currency_code: 'EUR',
            value: price.toString(),
            description: title,
          },
        },
      ],
    }),
  })
    .catch((error) => {
      console.error(`Error while initiating paypal payment: ${error}`);
      throw error;
    })
    .then(async (r) => r.json() as Promise<Record<string, unknown>>);

  if (!response['id'])
    console.error(`Error while creating PayPal order: ${JSON.stringify(response)}`);

  const { id } = response as { id: string };
  return id;
}

export async function finishPaypalPayment(orderId: string) {
  const response = await fetch(
    new URL(`/v2/checkout/orders/${orderId}/capture`, PUBLIC_PAYPAL_API_BASE_URL),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await accessToken()}`,
      },
    },
  );
  const { status } = (await response.json()) as { status: string };
  return status;
}

export function paypalPaymentStatus(status: string): PayPalTransactionStatus {
  switch (status) {
    case 'CREATED': {
      return PayPalTransactionStatus.Created;
    }

    case 'SAVED': {
      return PayPalTransactionStatus.Saved;
    }

    case 'APPROVED': {
      return PayPalTransactionStatus.Approved;
    }

    case 'VOIDED': {
      return PayPalTransactionStatus.Voided;
    }

    case 'COMPLETED': {
      return PayPalTransactionStatus.Completed;
    }

    case 'PAYER_ACTION_REQUIRED': {
      return PayPalTransactionStatus.PayerActionRequired;
    }

    default: {
      throw new Error(`Unknown paypal status ${status}`);
    }
  }
}

export async function checkPaypalPayment(
  orderId: string,
): Promise<{ paid: boolean; status: PayPalTransactionStatus }> {
  const response = await fetch(
    new URL(`/v2/checkout/orders/${orderId}`, PUBLIC_PAYPAL_API_BASE_URL),
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await accessToken()}`,
      },
    },
  );
  const { status } = (await response.json()) as { status: string };
  return {
    paid: ['APPROVED', 'COMPLETED'].includes(status),
    status: paypalPaymentStatus(status),
  };
}

export async function payEventRegistrationViaPaypal(
  registrationId: string,
  emailAddress: string,
): Promise<string> {
  const registration = await prisma.registration.findUniqueOrThrow({
    where: { id: registrationId },
    include: { ticket: { include: { event: true } }, paypalTransaction: true },
  });

  // Transaction was already paid
  if (registration.paypalTransaction?.orderId) {
    const { paid, status } = await checkPaypalPayment(registration.paypalTransaction.orderId);
    if (paid) {
      await log('paypal', 'fallback mark as paid', { registration }, registration.id);
      await prisma.registration.update({
        where: { id: registration.id },
        data: { paid: true, paypalTransaction: { update: { status } } },
      });
    }
  }

  const orderId = await initiatePaypalPayment(
    registration.ticket.event.title,
    registration.ticket.price,
    registration.id,
  );

  // Create transaction
  await prisma.paypalTransaction.upsert({
    where: { registrationId: registration.id },
    create: {
      registration: { connect: { id: registration.id } },
      emailAddress,
      orderId,
    },
    update: {
      emailAddress,
      orderId,
    },
  });

  return orderId;
}
