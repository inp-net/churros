import { ENV } from '#lib';
import { STREAM_NAME, SUBJECT_NAME, type Message } from '@inp-net/notella';
import { nanoid } from 'nanoid';
import { connect, StringCodec, type JetStreamManager, type NatsConnection } from 'nats';

export { Event as NotellaEvent } from '@inp-net/notella';
export type NotellaMessage = Message;

let jetstreamManager: JetStreamManager;
let natsConnection: NatsConnection;

export async function queueNotification(
  message: Omit<Message, 'id' | 'send_at'> & { id?: string; send_at?: Date },
) {
  const nc = await setupNats();
  if (!nc) return;
  const js = nc.jetstream();
  const sc = StringCodec();

  message.id ??= nanoid(10);
  message.send_at ??= new Date();
  console.info(`Queuing notification ${message.id}`);
  await js.publish(SUBJECT_NAME, sc.encode(JSON.stringify(message)));
}

async function setupNats(): Promise<NatsConnection | undefined> {
  if (jetstreamManager && natsConnection) return natsConnection;

  if (!ENV.NOTELLA_URL) {
    console.warn("Notella URL not set, can't send notifications");
    return;
  }

  // Connect to the NATS server
  const nc = await connect({ servers: new URL(ENV.NOTELLA_URL).host });

  // Create a JetStream manager to manage streams
  const jsm = await nc.jetstreamManager();

  // Ensure the stream exists
  await setupStream(jsm, STREAM_NAME, SUBJECT_NAME);
  jetstreamManager = jsm;
  natsConnection = nc;
  return nc;
}

async function setupStream(
  jetStreamManager: JetStreamManager,
  streamName: string,
  subject: string,
) {
  try {
    // Try to add the stream (will not recreate if it exists)
    await jetStreamManager.streams.add({
      name: streamName,
      subjects: [subject],
    });
  } catch (error) {
    console.error(
      `Error setting up stream: ${error && typeof error === 'object' && 'message' in error ? error.message : 'unknown error'}`,
    );
  }
}
