import { ensureGlobalId, localID } from '#lib';
import { PrismaClient, PromotionType, type Event, type Group } from '@churros/db/prisma';

function usage(): never {
  console.error(
    'Usage: generate-promo-code <number of codes to generate> <valid until september of year> [<group uid>/<event uid to point to>]',
  );
  process.exit(1);
}

// Generate a random code from an alphabet that doesn't contain ambiguous characters
const ALPHABET = 'ABCDEFGHJKLMNPQRTUVWXY34689';

function generateCode(length: number): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

const prisma = new PrismaClient();

// get number of codes to generate from CLI args
const args = process.argv.slice(2);

if (![2, 3].includes(args.length)) {
  console.error(`Invalid number of arguments: expected 2 or 3, got ${args.length}`);
  usage();
}

const count = parseInt(args[0]!, 10);
const validUntilYear = parseInt(args[1]!, 10);
const eventId = args[2];

let promotion = await prisma.promotion.findFirst({
  where: { type: PromotionType.SIMPPS, validUntil: { gte: new Date() } },
});

if (!promotion) {
  console.log(`Creating SIMPPS promotion for ${validUntilYear}`);
  promotion = await prisma.promotion.create({
    data: {
      type: PromotionType.SIMPPS,
      // valid until next september (yes, in JS, months are 0-indexed)
      validUntil: new Date(validUntilYear, 8, 1),
      priceOverride: 1, // EUR
    },
  });
}

let event: undefined | (Event & { group: Group });

if (eventId) {
  if (!eventId) {
    console.error('Invalid event ID');
    usage();
  }
  event = await prisma.event.update({
    where: { id: ensureGlobalId(eventId, 'Event') },
    data: {
      applicableOffers: { connect: { id: promotion.id } },
    },
    include: { group: true },
  });
  console.info(`Added ${event.title} to SIMPPS promotion ${promotion.id}`);
}

for (let i = 0; i < count; i++) {
  const code = generateCode(6);
  await prisma.promotionCode.create({
    data: {
      code,
      promotion: { connect: { id: promotion.id } },
    },
  });
  console.log(
    new URL(
      event ? `/events/${localID(event.id)}?claimCode=${code}` : `/claim-code/${code}`,
      process.env.PUBLIC_FRONTEND_ORIGIN,
    ).toString(),
  );
}
