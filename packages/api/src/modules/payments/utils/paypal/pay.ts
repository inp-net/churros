import { log, prisma } from '#lib';
import { checkPaypalPayment, initiatePaypalPayment } from '../../index.js';

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
