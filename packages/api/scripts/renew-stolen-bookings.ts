import { PrismaClient } from '@prisma/client';
import { isBefore, setHours, setMinutes } from 'date-fns';
import { readFileSync } from 'fs';
import omit from 'lodash.omit';
import { createTransport } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

const prisma = new PrismaClient();
const mailer = createTransport(process.env.SMTP_URL);

const stolenList = readFileSync('./stolen-bookings', 'utf-8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l.length > 0);

const stolenBookingsNewCodes = new Map<string, string>();

function invertMap<K, V>(map: Map<K, V>): Map<V, K> {
  return new Map(Array.from(map.entries()).map(([k, v]) => [v, k]));
}

function idToCode(id: string) {
  return id.replace(/^r:/, '').toUpperCase();
}

async function bookingsOfEvent({
  eventUid,
  groupUid,
  ticketName,
}: {
  eventUid: string;
  groupUid: string;
  ticketName: string;
}) {
  return prisma.registration.findMany({
    where: {
      ticket: { name: ticketName, event: { uid: eventUid, group: { uid: groupUid } } },
      cancelledAt: null,
      opposedAt: null,
    },
  });
}

function bookedBefore(date: Date): (booking: { createdAt: Date }) => boolean {
  return (booking) => isBefore(booking.createdAt, date);
}

function bookingInStolenList(booking: { beneficiary: string }): boolean {
  return stolenList.includes(booking.beneficiary);
}

async function renew(code: string) {
  const data = await prisma.registration.findUnique({ where: { id: `r:${code.toLowerCase()}` } });
  if (!data) {
    console.error(`Booking ${code} not found`);
    return;
  }
  const [_, newRegistration] = await prisma.$transaction([
    prisma.registration.update({
      where: { id: data.id },
      data: {
        cancelledBy: { connect: { uid: 'astleyr' } },
        cancelledAt: new Date(),
        lydiaTransaction: { disconnect: true },
        paypalTransaction: { disconnect: true },
      },
    }),
    prisma.registration.create({
      data: {
        ...omit(data, ['id']),
      },
      include: {
        author: true,
        ticket: {
          include: {
            event: true,
          },
        },
      },
    }),
  ]);
  stolenBookingsNewCodes.set(idToCode(data.id), idToCode(newRegistration.id));

  return newRegistration;
}

async function mail(booking: Awaited<ReturnType<typeof renew>>) {
  if (!booking) return;
  const beneficiaryUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: booking.beneficiary.trim() }, { uid: booking.beneficiary.toLowerCase() }],
    },
  });
  const recipients = [
    ...new Set(
      [booking.author?.email ?? booking.authorEmail, beneficiaryUser?.email].filter(Boolean),
    ),
  ] as string[];
  return new Promise<SMTPTransport.SentMessageInfo>((resolve, reject) => {
    mailer.sendMail(
      {
        to: recipients,
        from: process.env.PUBLIC_CONTACT_EMAIL,
        subject: `Ta nouvelle place pour ${booking.ticket.event.title}`,
        html: `
          <p>Bonjour,</p>
          <p>Tu as réservé une place pour ${booking.ticket.event.title}.</p>
          <p>Malheureusement, suite à un bug au lancement de notre premier shotgun ouvert aux extés sur notre nouvelle plateforme, il y a des risques que ta place ait été volée par d'autres.</p>
          <p>C'est pourquoi nous avons annulés toutes les places que nous pensons avoir été volées</p>
          <p>Bien évidemment, tu n'a rien à payer en plus, on t'a juste fait une nouvelle réservation (avec un nouveau code de réservation).</p>
          <p><a href="${process.env.FRONTEND_ORIGIN}/bookings/${
            booking.id
          }">Ma nouvelle réservation</a> </p>
          <p>En cas de problème, ces informations seront utiles:
          <ul>
            <li><strong>Ancien code:</strong> <code>${idToCode(
              invertMap(stolenBookingsNewCodes).get(idToCode(booking.id)) ?? '(introuvable)',
            )}</code></li>
            <li><strong>Nouveau code:</strong> <code>${idToCode(booking.id)}</code></li>
          </ul>
          </p>
          <p>Désolé pour le dérangement,</p>
          <p><a href="https://churros.inpt.fr/groups/net7-n7">net7</a> &amp; <a href="https://churros.inpt.fr/groups/inp-net-inp">INP-net</a></p>
        `,
        text: `Bonjour,
Tu as réservé une place pour ${booking.ticket.event.title}.

Malheureusement, suite à un bug au lancement de notre premier shotgun ouvert aux extés sur notre nouvelle plateforme, il y a des risques que ta place ait été volée par d'autres.

C'est pourquoi nous avons annulés toutes les places que nous pensons avoir été volées
par d'autres.

Bien évidemment, tu n'a rien à payer en plus, on t'a juste fait une nouvelle réservation (avec un nouveau code de réservation).

Ma nouvelle réservation: ${process.env.FRONTEND_ORIGIN}/bookings/${booking.id}

En cas de problème, ces informations seront utiles:
- Ancien code: ${invertMap(stolenBookingsNewCodes).get(idToCode(booking.id))!}
- Nouveau code: ${idToCode(booking.id)}

Désolé pour le dérangement,
net7 & INP-net`,
      },
      (err, info) => {
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      },
    );
  });
}

async function main(
  groupUid: string,
  eventUid: string,
  ticketName: string,
  bookedBeforeDate: Date,
) {
  const stolenBookings = (await bookingsOfEvent({ groupUid, eventUid, ticketName })).filter(
    (b) => bookingInStolenList(b) || bookedBefore(bookedBeforeDate)(b),
  );
  console.log(`Found ${stolenBookings.length} stolen bookings`);

  await Promise.allSettled(
    stolenBookings.map(async (booking) => {
      const newBooking = await renew(idToCode(booking.id));
      await mail(newBooking)
        .catch(console.error)
        .then((info) => console.log(`Sent to ${info?.accepted?.join(', ')}: ${info?.response}`));
    }),
  );

  console.log(`Renewed ${stolenBookingsNewCodes.size} bookings`);
  console.log(JSON.stringify(Object.fromEntries(stolenBookingsNewCodes.entries()), undefined, 2));
}

await main('groupe-1', 'ceci-est-un-evenement', 'Extés', setHours(setMinutes(new Date(), 0), 15));
