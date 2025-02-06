import { log, prisma, publish } from '#lib';
import { notify, queueNotification } from '#modules/notifications/utils';
import { lydiaSignature, verifyLydiaTransaction } from '#modules/payments';
import { Event as NotellaEvent } from '@inp-net/notella';
import express from 'express';
import { z } from 'zod';

export const lydiaWebhook = express();

// Lydia webhook
lydiaWebhook.get('/lydia-webhook/alive', (_, res) => {
  res.sendStatus(200);
});

lydiaWebhook.post('/lydia-webhook', async (req, res) => {
  // Retrieve the params from the request
  const signatureParameters = z
    .object({
      request_id: z.string(),
      amount: z.string(),
      currency: z.string(),
      sig: z.string(),
      signed: z.string(),
      transaction_identifier: z.string(),
      vendor_token: z.string(),
    })
    .parse(req.body);

  const { request_id, sig, transaction_identifier } = signatureParameters;

  try {
    const { verified, transaction } = await verifyLydiaTransaction(
      request_id,
      signatureParameters,
      sig,
    );

    await log('lydia', 'webhook', { verified, transaction }, transaction_identifier);

    if (!verified) {
      await log(
        'lydia',
        'webhook/error',
        { verified, transaction, why: 'Transaction signature is invalid' },
        transaction_identifier,
      );
      res.status(400).send('Transaction signature is invalid');
      return;
    }

    if (!transaction) {
      await log(
        'lydia',
        'webhook/error',
        { verified, transaction, why: 'Transaction not found' },
        transaction_identifier,
      );
      res.status(400).send('Transaction not found');
      return;
    }

    // Check if the beneficiary exists
    if (transaction.registration) {
      if (!transaction.registration.ticket.event.beneficiary) {
        await log(
          'lydia',
          'webhook/error',
          { verified, transaction, why: 'Beneficiary not found' },
          transaction_identifier,
        );
        res.status(400).send('Beneficiary not found');
        return;
      }

      if (
        sig ===
        lydiaSignature(transaction.registration.ticket.event.beneficiary, signatureParameters)
      ) {
        await log(
          'lydia',
          'webhook/mark-booking',
          { verified, transaction, message: 'making booking transaction as paid' },
          transaction_identifier,
        );
        const txn = await prisma.lydiaTransaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            transactionId: transaction_identifier,
            registration: {
              update: {
                paid: true,
              },
            },
          },
          select: {
            paidCallback: true,
            registration: {
              select: {
                id: true,
                author: true,
                ticket: {
                  select: {
                    id: true,
                    event: {
                      select: {
                        id: true,
                        group: {
                          select: {
                            uid: true,
                          },
                        },
                        title: true,
                      },
                    },
                  },
                },
              },
            },
            contribution: {
              select: {
                id: true,
                user: true,
                option: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });
        if (txn.registration?.author) {
          publish(txn.registration.id, 'updated', txn);
          // remove when notella confirmed
          await notify([txn.registration.author], {
            title: 'Place payée',
            body: `Ta réservation pour ${txn.registration.ticket.event}`,
            data: {
              channel: 'Other',
              goto: txn.paidCallback ?? '/',
              group: undefined,
            },
          });
          // end remove when notella confirmed
          await queueNotification({
            title: 'Place payée',
            body: `Ta réservation pour ${txn.registration.ticket.event}`,
            action: txn.paidCallback ?? '/',
            event: NotellaEvent.BookingPaid,
            object_id: txn.registration.id,
          });
        } else if (txn.contribution?.user) {
          // remove when notella confirmed
          await notify([txn.contribution.user], {
            title: 'Cotisation payée',
            body: `Ta cotisation "${txn.contribution.option.name}" a bien été payée`,
            data: {
              channel: 'Other',
              goto: txn.paidCallback ?? '/',
              group: undefined,
            },
          });
          // end remove when notella confirmed
          await queueNotification({
            title: 'Cotisation payée',
            body: `Ta cotisation "${txn.contribution.option.name}" a bien été payée`,
            action: txn.paidCallback ?? '/',
            event: NotellaEvent.ContributionPaid,
            object_id: txn.contribution.id,
          });
        }
        res.status(200).send('OK');
        return;
      }
    } else if (transaction.contribution) {
      const { beneficiary } = transaction.contribution.option;
      if (!beneficiary) {
        await log(
          'lydia',
          'webhook/error',
          { verified, transaction, why: 'No lydia account linked' },
          transaction_identifier,
        );
        res.status(400).send('No lydia accounts for this student association');
        return;
      }

      if (sig === lydiaSignature(beneficiary, signatureParameters)) {
        await prisma.contribution.update({
          where: {
            id: transaction.contribution.id,
          },
          data: {
            paid: true,
          },
        });

        await log(
          'lydia',
          'webhook/mark-contribution',
          { verified, transaction, message: 'making contribution transaction as paid' },
          transaction_identifier,
        );
        res.status(200).send('OK');
        return;
      }
    }

    res.status(400).send('Bad request');
  } catch {
    res.status(400).send('Bad request');
  }
});
