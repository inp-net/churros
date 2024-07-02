import { builder, prisma, yearTier } from '#lib';
import { EventType } from '#modules/events';
import { fullName } from '#modules/users';
import { canSeeBookings } from '../index.js';

builder.prismaObjectField(EventType, 'bookingsCsv', (t) =>
  t.string({
    description:
      "Renvoie un texte au format CSV contenant un export des réservations de l'évènement.",
    errors: {},
    async authScopes(event, _, { user: me }) {
      return canSeeBookings(event, me);
    },
    async resolve({ id }) {
      const registrations = await prisma.registration.findMany({
        where: {
          ticket: {
            eventId: id,
          },
        },
        include: {
          ticket: true,
          author: {
            include: {
              major: true,
              contributions: { include: { option: { include: { paysFor: true } } } },
            },
          },
        },
      });
      let result = '';

      if (registrations.length <= 0) return '';
      const columns = [
        'Date de réservation',
        'Bénéficiaire',
        'Achat par',
        'Payée',
        'Scannée',
        'En opposition',
        'Annulée',
        'Méthode de paiement',
        'Billet',
        'Cotisant',
        'Filière',
        'Année',
        'Promo',
        'Code de réservation',
        'Lien vers la place',
      ] as const;

      const humanBoolean = (b: boolean) => (b ? 'Oui' : 'Non');
      const mapping = (
        {
          createdAt,
          verifiedAt,
          opposedAt,
          cancelledAt,
          paid,
          authorEmail,
          author,
          ticket,
          paymentMethod,
          id,
          beneficiary,
        }: (typeof registrations)[number],
        benef:
          | undefined
          | null
          | {
              firstName: string;
              major: null | { shortName: string };
              graduationYear: number;
              lastName: string;
              contributions: Array<{ option: { paysFor: Array<{ uid: string | null }> } }>;
            },
      ) =>
        ({
          'Date de réservation': createdAt.toISOString(),
          'Bénéficiaire': (benef ? fullName(benef) : beneficiary) || authorEmail,
          'Achat par': author ? fullName(author) : authorEmail,
          'Payée': humanBoolean(paid),
          'Scannée': humanBoolean(Boolean(verifiedAt) && paid),
          'En opposition': humanBoolean(Boolean(opposedAt)),
          'Annulée': humanBoolean(Boolean(cancelledAt)),
          'Méthode de paiement': paymentMethod ?? 'Inconnue',
          'Billet': ticket.name,
          'Cotisant': benef
            ? humanBoolean(
                benef.contributions.some(({ option: { paysFor } }) =>
                  paysFor.some(({ uid }) => uid === 'aen7'),
                ),
              )
            : '',
          'Filière': benef?.major?.shortName ?? '',
          'Année': benef ? `${yearTier(benef.graduationYear)}A` : '',
          'Promo': benef?.graduationYear.toString() ?? '',
          'Code de réservation': id.replace(/^r:/, '').toUpperCase(),
          'Lien vers la place': `${process.env.FRONTEND_ORIGIN}/bookings/${id.replace(/^r:/, '')}/`,
        }) satisfies Record<(typeof columns)[number], string>;

      result = columns.join(',') + '\n';

      for (const reg of registrations) {
        const benef = reg.beneficiary
          ? await prisma.user.findUnique({
              where: { uid: reg.beneficiary },
              include: {
                major: true,
                contributions: { include: { option: { include: { paysFor: true } } } },
              },
            })
          : reg.author;
        const data = mapping(reg, benef);
        result += columns.map((c) => data[c]).join(',') + '\r\n';
      }

      return result;
    },
  }),
);
