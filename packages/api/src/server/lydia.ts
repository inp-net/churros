import { log, prisma, publish } from '#lib';
import { notify } from '#modules/notifications/utils';
import { lydiaSignature, verifyLydiaTransaction } from '#modules/payments';
import express from 'express';
import multer from 'multer';

export const lydiaWebhook = express();
const upload: multer.Multer = multer();

// Lydia webhook
lydiaWebhook.get('/lydia-webhook/alive', (_, res) => {
  res.sendStatus(200);
});

lydiaWebhook.post('/lydia-webhook', upload.none(), async (req, res) => {
  // Retrieve the params from the request
  const { request_id, amount, currency, sig, signed, transaction_identifier, vendor_token } =
    req.body as {
      request_id: string;
      amount: string;
      currency: string;
      sig: string;
      signed: string;
      transaction_identifier: string;
      vendor_token: string;
    };

  const signatureParameters = {
    currency,
    request_id,
    amount,
    signed,
    transaction_identifier,
    vendor_token,
  };

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
      return res.status(400).send('Transaction signature is invalid');
    }

    if (!transaction) {
      await log(
        'lydia',
        'webhook/error',
        { verified, transaction, why: 'Transaction not found' },
        transaction_identifier,
      );
      return res.status(400).send('Transaction not found');
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
        return res.status(400).send('Beneficiary not found');
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
          await notify([txn.registration.author], {
            title: 'Place payée',
            body: `Ta réservation pour ${txn.registration.ticket.event}`,
            data: {
              channel: 'Other',
              goto: txn.paidCallback ?? '/',
              group: undefined,
            },
          });
        } else if (txn.contribution?.user) {
          await notify([txn.contribution.user], {
            title: 'Cotisation payée',
            body: `Ta cotisation "${txn.contribution.option.name}" a bien été payée`,
            data: {
              channel: 'Other',
              goto: txn.paidCallback ?? '/',
              group: undefined,
            },
          });
        }
        return res.status(200).send('OK');
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
        return res.status(400).send('No lydia accounts for this student association');
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
        return res.status(200).send('OK');
      }
    }

    return res.status(400).send('Bad request');
  } catch {
    return res.status(400).send('Bad request');
  }
});
