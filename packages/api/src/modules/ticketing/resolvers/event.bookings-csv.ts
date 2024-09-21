import { builder, graphinx, localID, prisma, yearTier } from '#lib';
import { EventType } from '#modules/events';
import { URLScalar } from '#modules/global';
import { canSeeAllBookings } from '#modules/ticketing/utils';
import { fullName } from '#modules/users';
import { ZodError } from 'zod';

builder.prismaObjectField(EventType, 'bookingsCsv', (t) =>
  t.string({
    description:
      "Renvoie un texte à un format demandé contentant un export des réservations de l'évènement.",
    errors: { types: [Error, ZodError] },
    args: {
      bookingURL: t.arg({
        type: URLScalar,
        description:
          "Un texe représentant les URLs des pages de réservation individuelles. Dans ce texte, les occurences de '[code]' seront remplacées par le code de réservation.",
      }),
      dialect: t.arg({
        defaultValue: 'Standard',
        type: builder.enumType('CsvDialect', {
          ...graphinx('ticketing'),
          description: 'Le dialecte CSV à utiliser',
          values: {
            Standard: {
              value: 'Standard',
              description:
                "Dialecte CSV standard: séparé par des virgules, avec des guillemets quand nécéssaire seulement. S'ouvre sans soucis dans la plupart des logiciels de tableur, excepté Excel.",
            },
            Excel: {
              value: 'Excel',
              description:
                'Dialecte CSV pour Excel: séparé par des point-virgules, et toujours guillemeté.',
            },
          },
        }),
      }),
    },
    async authScopes(event, _, { user: me }) {
      return canSeeAllBookings(event, me);
    },
    async resolve({ id }, { dialect, bookingURL }) {
      const SEPARATOR = dialect === 'Excel' ? ';' : ',';
      const quoteValue = (value: string) => {
        if (dialect === 'Excel' || value.includes(SEPARATOR) || value.includes('"'))
          return `"${value.replaceAll('"', '""')}"`;

        return value;
      };
      const csvLine = (values: readonly string[]) =>
        values.map(quoteValue).join(SEPARATOR) + '\r\n';
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
          internalBeneficiary: {
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
        'Prix',
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
          externalBeneficiary,
          wantsToPay,
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
          'Bénéficiaire': (benef ? fullName(benef) : externalBeneficiary) || authorEmail,
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
          // For confidentiality reasons, we won't show actual price paid if it's lower than the minimum (this means the user used a promotion, and some promotions are sensitive information)
          'Prix': (wantsToPay ?? ticket.minimumPrice).toString(),
          'Code de réservation': localID(id).toUpperCase(),
          'Lien vers la place': bookingURL
            .toString()
            .replaceAll('[code]', localID(id).toUpperCase()),
        }) satisfies Record<(typeof columns)[number], string>;

      result = csvLine(columns);

      for (const reg of registrations) {
        const data = mapping(reg, reg.internalBeneficiary ?? reg.author);
        result += csvLine(columns.map((col) => data[col]));
      }

      return result;
    },
  }),
);
