import { prisma, publish } from '#lib';

export async function log(
  area: string,
  action: string,
  message: unknown,
  target?: string | null,
  user?: { uid: string },
) {
  let stringifiedMessage = '';
  try {
    stringifiedMessage = JSON.stringify(message);
  } catch {
    stringifiedMessage = '(NON-JSON-ENCODABLE MESSAGE)';
  }
  // eslint-disable-next-line no-console
  console.log(`<${area}> ${action} ${target ? `on ${target}: ` : ''}${stringifiedMessage}`);
  await prisma.logEntry.create({
    data: {
      area,
      action,
      message: stringifiedMessage,
      target,
      user: user ? { connect: { uid: user.uid } } : undefined,
    },
  });
  if (area === 'oauth' && target) await publish(target, 'updated', message);
}
