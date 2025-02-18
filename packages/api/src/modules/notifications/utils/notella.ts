import { ENV } from '#lib';
import { STREAM_NAME, SUBJECT_NAME, type Event, type Message } from '@inp-net/notella';
import { isPast } from 'date-fns';
import { nanoid } from 'nanoid';
import { connect, StringCodec, type JetStreamManager, type NatsConnection } from 'nats';

export { Event as NotellaEvent } from '@inp-net/notella';
export type NotellaMessage = Message;

let jetstreamManager: JetStreamManager;
let natsConnection: NatsConnection;

export async function queueNotification({
  /** Queue notification even if send_at is in the past */
  eager = true,
  /** Clear other jobs for the same object_id. If true, clear jobs that have the same event type as this one. If false, don't clear anything. If an array, clear those event types. If an event type, clear only that event type  */
  clear_schedule = false,
  ...msg
}: Omit<Message, 'id' | 'send_at' | 'clear_schedule_for'> & {
  id?: string;
  send_at?: Date;
  eager?: boolean;
  clear_schedule?: boolean | Event | Event[];
}) {
  const message: Message = {
    id: nanoid(10),
    send_at: new Date(),
    clear_schedule_for:
      clear_schedule === false
        ? []
        : clear_schedule === true
          ? [msg.event]
          : Array.isArray(clear_schedule)
            ? clear_schedule
            : [clear_schedule],
    ...msg,
  };

  if (!eager && isPast(message.send_at)) return;

  console.info(
    `Queuing notification ${message.id}: ${message.event} for ${message.object_id} at ${message.send_at.toISOString()}`,
  );

  await send(message);
}

async function send(message: Message) {
  const nc = await setupNats();
  if (!nc) return;
  const js = nc.jetstream();
  const sc = StringCodec();
  await js.publish(SUBJECT_NAME, sc.encode(JSON.stringify(message)));
}

async function setupNats(): Promise<NatsConnection | undefined> {
  if (jetstreamManager && natsConnection) return natsConnection;

  if (!ENV.NOTELLA_NATS_URL) {
    console.warn("Notella URL not set, can't send notifications");
    return;
  }

  // Connect to the NATS server
  const nc = await connect({ servers: new URL(ENV.NOTELLA_NATS_URL).host });

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
