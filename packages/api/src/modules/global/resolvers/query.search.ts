// TODO create search module for this, can't have things importing into global
// builder.queryField('search', (t) =>
//   t.authField({
//     type: [MixedSearchResultType],
//     args: {
//       q: t.arg.string(),
//     },
//     authScopes: { student: true },
//     async resolve(_, { q }) {
//       const results = await Promise.allSettled([searchUsers(q), searchGroups(q)]);
//       if (results.some((r) => r.status !== 'fulfilled'))
//         throw new GraphQLError("Une erreur s'est produite lors de la recherche.");
//       const mixed = results.flatMap(
//         (r) =>
//           (r.status === 'fulfilled' ? r.value : []) as Array<
//             SearchResult<{ group: Group } | { user: User }, ['description']>
//           >,
//       );
//       return mixed;
//     },
//   }),
// );
