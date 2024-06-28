import { error } from '@sveltejs/kit';

export function load() {
  error(400, 'Page momentanéement désactivée');
}

// export const load: PageLoad = async ({ fetch, parent, params }) => {
//   const shownWeek = parse(params.monday, 'yyyy-MM-dd', new Date());
//   shownWeek.setHours(23);
//   shownWeek.setMinutes(59);
//   return {
//     shownWeek,
//     ...(await loadQuery(
//       {
//         eventsInWeek: [
//           { today: shownWeek },
//           Selector('Event')({
//             id: true,
//             startsAt: true,
//             endsAt: true,
//             frequency: true,
//             recurringUntil: true,
//             location: true,
//             title: true,
//             pictureFile: true,
//             descriptionHtml: true,
//             descriptionPreview: true,
//             group: {
//               uid: true,
//               name: true,
//               pictureFile: true,
//               pictureFileDark: true,
//             },
//             uid: true,
//             placesLeft: true,
//             capacity: true,
//             tickets: {
//               name: true,
//               opensAt: true,
//               closesAt: true,
//               price: true,
//               placesLeft: true,
//               capacity: true,
//               uid: true,
//             },
//           }),
//         ],
//         barWeekNow: [
//           { now: shownWeek },
//           {
//             descriptionHtml: true,
//             groups: {
//               uid: true,
//               pictureFile: true,
//               pictureFileDark: true,
//               name: true,
//             },
//           },
//         ],
//       },
//       { fetch, parent },
//     )),
//   };
// };
