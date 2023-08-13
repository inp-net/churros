import icsService from 'ics-service';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { generateIcs } = icsService;
import type { EventAttributes } from 'ics';
import type { RequestHandler } from './$types';
import { loadQuery } from '$lib/zeus';
import { htmlToText } from 'html-to-text';

export const GET: RequestHandler = async ({ locals, fetch, url }) => {
  const { me } = locals;

  const { events } = await loadQuery(
    {
      events: [
        {},
        {
          edges: {
            node: {
              uid: true,
              title: true,
              group: { uid: true, name: true, email: true },
              descriptionHtml: true,
              location: true,
              startsAt: true,
              endsAt: true,
              id: true,
            },
          },
        },
      ],
    },
    {
      fetch,
      async parent() {
        return new Promise((resolve) => {
          resolve({ me, token: '', mobile: true });
        });
      },
    }
  );

  const toDatetimeAray = (date: Date): [number, number, number, number, number] => [
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  ];

  const icsEvents: EventAttributes[] = events.edges.map(({ node }) => ({
    start: toDatetimeAray(node.startsAt),
    end: toDatetimeAray(node.endsAt),
    calName: 'AEn7',
    description: htmlToText(node.descriptionHtml),
    location: node.location,
    htmlContent: node.descriptionHtml,
    organizer: {
      email: node.group.email,
      name: node.group.name,
    },
    title: node.title,
    uid: node.id,
    url: new URL(
      `/events/${node.group.uid}/${node.uid}/`,
      `${url.protocol}//${url.host}`
    ).toString(),
    productId: 'bde.enseeiht.fr',
  }));

  type GenerateICSType = (title: string, events: EventAttributes[], url: string) => string;
  const feedContent = (generateIcs as GenerateICSType)(
    'AEn7',
    icsEvents,
    new URL(`/events/feed`, `${url.protocol}//${url.host}`).toString()
  );

  return new Response(feedContent, {
    headers: {
      'Content-Type': 'text/calendar',
    },
  });
};
