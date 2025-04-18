# @churros/api

## 14.0.2

### Patch Changes

- c261c30: fix(deps): update dependency connect-redis to ^8.0.2 (!682)
- b0123cb: fix(deps): update dependency @envelop/core to ^5.2.3 (!665)
- be397c0: fix(deps): update dependency graphql-scalars to ^1.24.2 (!684)
- be397c0: fix(deps): update dependency i18next to ^24.2.3 (!687)
- 9e987ef: fix(deps): update dependency multer to ^1.4.5-lts.2 (!691)
- be397c0: chore(deps): update nodejs (!681)
- be397c0: fix(deps): update notella to v0.17.1 (!685)
- 3dd2e08: fix(deps): update dependency prettier to ^3.5.3 (!694)
- Updated dependencies [818a0f8]
- Updated dependencies [be397c0]
- Updated dependencies [1113183]
  - @churros/db@4.3.5
  - arborist@0.1.7

## 14.0.1

### Patch Changes

- bb77173: fix(deps): update dependency graphql-yoga to ^5.12.1 (!659)
- a414f76: fix(deps): update dependency keep-a-changelog to ^2.6.1 (!653)
- f36bb35: fix(deps): update dependency nanoid to ^5.1.2 (!655)
- c8f2c86: fix(deps): update dependency @pothos/core to v4.4.1 (!663)
- Updated dependencies [c8f2c86]
  - @churros/db@4.3.4

## 14.0.0

### Major Changes

- 2507838: Remove deprecated Mutation.upsertGroup
- 229a501: Put lydia webhook and prometheus exporter on the same port as the API (4000)

### Patch Changes

- c3cc7a8: fix(deps): update dependency @envelop/core to ^5.1.0 (!637)
- 4489a77: fix(deps): update dependency graphql-yoga to ^5.12.0 (!640)
- 89c8430: chore(deps): update dependency @types/jsonwebtoken to ^9.0.9 (!649)
- c3cc7a8: fix(deps): update dependency ldap-authentication to ^3.3.3 (!648)
- 1fa3db4: fix(deps): update notella to v0.17.0 (!635)
- 18bcafb: canCreateGroup would always return false
- 5a9f4ec: fix(deps): update dependency @pothos/core to v4.4.0 (!644)
- da9dce1: fix(deps): update dependency prettier to ^3.5.2 (!650)
- 382cad8: fix(deps): update prisma monorepo to ^6.4.1 (!646)
- c3cc7a8: fix(deps): update dependency tsx to ^4.19.3 (!638)
- 68f169e: fix(deps): update dependency ws to ^8.18.1 (!651)
- Updated dependencies [5a9f4ec]
- Updated dependencies [382cad8]
  - @churros/db@4.3.3

## 13.0.0

### Major Changes

- e4d37f6: remove old notifications handling. Everything goes through notella now.

### Patch Changes

- ec0870c: fix(deps): update dependency graphql-ws to ^6.0.4 (!612)
- 98b55c6: fix(deps): update dependency nanoid to ^5.1.0 (!618)
- ec0870c: fix(deps): update dependency nats to ^2.29.2 (!614)
- 8b72d36: chore(deps): update nodejs (!598)
- f9e4478: fix(deps): update dependency prettier to ^3.5.1 (!609)
- 6615941: fix(deps): update dependency zod to ^3.24.2 (!601)
- Updated dependencies [9e10869]
- Updated dependencies [8b72d36]
  - @churros/db@4.3.2
  - arborist@0.1.6

## 12.3.0

### Minor Changes

- 4ecb677: warn managers or admins when they're bypassing checks when booking a ticket
- 6c53ddd: Rate-limit Mutation.bookEvent to 1/10 seconds

### Patch Changes

- a8c7bcb: fix(deps): update dependency prettier to ^3.5.0 (!584)
- 7f06985: fix(deps): update dependency remark-gfm to ^4.0.1 (!586)
- 18f2499: rate limits are applied again
- 7f06985: fix(deps): update dependency ua-parser-js to ^2.0.2 (!583)

## 12.2.0

### Minor Changes

- a47ab5b: Add argument Mutation.housekeep:dryRun
- 72893d1: health checks are resolved on fields themselves, so that e.g. requesting healthcheck { database { prisma }} only executes a prisma healthcheck, instead of executing all checks and only returning data from the database.prisma part of the total health check

### Patch Changes

- 986820f: Query.logs:target would use search operator syntax, which prevented items with ':' in them
- fd64a14: fix(deps): update notella to v0.15.3 (!576)

## 12.1.0

### Minor Changes

- 6fb2412: Add more filtering arguments to Query.logs, add Query.log

### Patch Changes

- 0e82f9d: fix(deps): update dependency firebase-admin to ^13.1.0 (!571)
- 6709369: fix(deps): update dependency graphql-yoga to ^5.11.0 (!569)
- 6aecb8d: fix(deps): update dependency ioredis to ^5.5.0 (!573)
- Updated dependencies [6aecb8d]
  - @churros/db@4.3.1

## 12.0.0

### Major Changes

- 12b62f4: remove NotificationChannel.Comments

### Patch Changes

- 9b78610: fix(deps): update notella to v0.15.0 (!568)
- Updated dependencies [12b62f4]
  - @churros/db@4.3.0

## 11.0.2

### Patch Changes

- 639fef9: fix(deps): update dependency @inp-net/notella to v0.11.4 (!558)

## 11.0.1

### Patch Changes

- 87ddf2c: fix(deps): update dependency @clack/prompts to ^0.10.0 (!554)
- f35ea39: bump notella to v0.10.4

## 11.0.0

### Major Changes

- d5abb5c: notifications are now handled by a separate scheduler process, see git.inpt.fr/churros/notella
- d5abb5c: default value for Mutation.acknowledgeChangelog:version and Query.combinedChangelog:to were removed

### Minor Changes

- d5abb5c: deprecate Article.notifiedAt

### Patch Changes

- a499885: PUBLIC_API_ORIGIN_WEB was not taken into account when computing Pictured.pictureURL
- 4c7cfde: updating user's last-seen date in database always failed
- fa35bcb: fix(deps): update dependency croner to ^8.1.2 (!549)
- 6e48f56: chore(deps): update dependency graphinx to ^0.12.2 (!387)
- fa35bcb: fix(deps): update dependency nats (!550)
- 9359f91: chore(deps): update dependency @types/node to ^20.17.17 (!542)
- 8ea502c: fix(deps): update prisma monorepo to ^6.3.1 (!546)
- 2e8d8c4: fix(deps): update dependency rehype-highlight to ^7.0.2 (!537)
- 549df42: fix(deps): update dependency semver to ^7.7.1 (!540)
- ecec087: fix(deps): update dependency ua-parser-js to ^2.0.1 (!547)
- 8ea502c: chore(deps): update dependency @types/web-push to ^3.6.4 (!548)
- Updated dependencies [d5abb5c]
- Updated dependencies [9359f91]
- Updated dependencies [8ea502c]
  - @churros/db@4.2.0
  - arborist@0.1.5

## 10.2.1

### Patch Changes

- bbc1775: fix(deps): update dependency firebase-admin to v13 (!520)
- ca57f51: fix(deps): update dependency i18next to v24 (!521)

## 10.2.0

### Minor Changes

- 8d94a13: add Query.version to get the current api version, and serve a server manifest at .well-known/churros.app/server.json

### Patch Changes

- b445dc2: fix(deps): update dependency date-fns-tz to ^3.2.0 (!509)
- 816bfba: fix(deps): update dependency graphql-ws to ^6.0.3 (!510)
- a6966ce: fix(deps): update dependency ldap-authentication to ^3.2.6 (!511)
- 9bc1b79: trackShare did not work for articles
- b7d0aaa: fix(deps): update prisma monorepo to v6 (major) (!464)
- Updated dependencies [9bc1b79]
- Updated dependencies [b7d0aaa]
  - @churros/db@4.1.6

## 10.1.0

### Minor Changes

- 292e56e: Allow dynamic ticket links based on the booking's code, using [code]

### Patch Changes

- 1c9d2f4: fix(deps): update dependency chalk to ^5.4.1 (!498)
- 9db4f8b: fix(deps): update dependency @clack/prompts to ^0.9.1 (!502)
- a3deb82: fix(deps): update dependency connect-redis to v8 (!460)
- bbf5895: fix(deps): update dependency date-fns to v4 (!461)
- d445d96: fix(deps): update dependency @envelop/core to ^5.0.3 (!451)
- c8c085a: fix(deps): update dependency glob to ^11.0.1 (!471)
- 28d9965: fix(deps): update dependency google-auth-library to ^9.15.1 (!503)
- 5569d5d: fix(deps): update dependency graphql to ^16.10.0 (!472)
- c8c085a: fix(deps): update dependency graphql-scalars to ^1.24.1 (!473)
- a3deb82: fix(deps): update dependency graphql-ws to v6 (!463)
- c8c085a: fix(deps): update graphql-yoga monorepo (!481)
- d445d96: fix(deps): update dependency ioredis to ^5.4.2 (!453)
- c8c085a: fix(deps): update linkifyjs monorepo to ^4.2.0 (!482)
- 92e7bab: chore(deps): update node.js to v20.18.2 (!456)
- 92e7bab: fix(deps): update dependency nodemailer to ^6.10.0 (!493)
- 9db4f8b: fix(deps): update dependency nodemon to ^3.1.9 (!500)
- 9db4f8b: fix(deps): update dependency npm-run-all2 to ^7.0.2 (!501)
- 92e7bab: fix(deps): update dependency pdfmake to ^0.2.18 (!474)
- c8c085a: fix(deps): update dependency phone to ^3.1.58 (!475)
- c8c085a: fix(deps): update dependency rate-limiter-flexible to ^5.0.5 (!476)
- c6875b0: fix(deps): update dependency semver to ^7.7.0 (!488)
- 92e7bab: fix(deps): update dependency typescript to ^5.7.3 (!478)
- 3f31893: fix(deps): update dependency unaccent to ^0.3.0 (!489)
- cdbe114: chore(deps): update dependency @vizdom/vizdom-ts-node to ^0.1.19 (!446)
- c8c085a: fix(deps): update dependency yaml to ^2.7.0 (!480)
- d445d96: fix(deps): update dependency zod to ^3.24.1 (!454)
- Updated dependencies [1c9d2f4]
- Updated dependencies [5569d5d]
- Updated dependencies [d445d96]
- Updated dependencies [92e7bab]
- Updated dependencies [9db4f8b]
- Updated dependencies [92e7bab]
  - @churros/db@4.1.5
  - arborist@0.1.4

## 10.0.0

### Major Changes

- c1e9496: default value for Mutation.acknowledgeChangelog:version and Query.combinedChangelog:to were removed

### Patch Changes

- 4143201: chore(deps): update dependency chokidar to ^4.0.3 (!425)
- f68a9a1: chore(deps): update dependency concurrently to ^9.1.2 (!426)
- f68a9a1: chore(deps): update dependency @types/ws to ^8.5.14 (!422)

## 9.1.0

### Minor Changes

- 104e3ab: remove /dump, add /dump/migrations/{names,list} to peek easily at the db migration state in production, useful for devops

### Patch Changes

- e41296f: User.deletionConsequence would try to count comments, but the table was removed
- Updated dependencies [b779ec4]
  - @churros/db@4.1.4

## 9.0.1

### Patch Changes

- 6cdab09: chore(deps): update dependency @types/jsonwebtoken to ^9.0.8 (!420)
- Updated dependencies [6cdab09]
- Updated dependencies [535587d]
  - arborist@0.1.3
  - @churros/db@4.1.1

## 9.0.0

### Major Changes

- d46f5c7: Change return types of Mutation.{accept,refuse}Registration; change arguments to Mutation.updateUserCandidate
- a0721d8: Event.placesLeft and Ticket.placesLeft are now of type Capacity and not Int. Instead of -1 to represent infinity, the Capacity scalar is used
- d46f5c7: rename Mutation.{accept,refuse}Registration to Mutation.{accept,refuse}UserCandidate
- a09feb9: - add required argument bookingUrl to Mutation.bookEvent,
  - add optional arguments authorName and pointOfContact to Mutation.bookEvent
  - add Registration.pointOfContact and Registration.authorName.
  - add Event.enforcePointOfContact and argument enforcePointOfContact to Mutation.updateEvent
- 50bc062: remove deprecated Mutation.upsertRegistration
- a50aec4: Make Mutation.deleteAnnouncement return a Result<Announcement> instead of Boolean

### Minor Changes

- dda7171: Add FeaturesHealthCheck.housekeeper
- d46f5c7: redesign signups management page
- 89f386f: allow users to delete their accounts
- 5880beb: allow hiding capacity on tickets
- a09feb9: add point of contacts on event (see #1229), allow specifying authorName when booking an event while loggedout (see #1209)
- 072d7f5: add event manager invite links system
- 1cd5f3d: Add Query.userCandidatesCount
- 8f63ff5: show event managers inherited from group memberships
- 7be2de4: disallow some visibilities when an event has tickets open to external users. reflect this clearly in the UI too
- dda7171: Add Mutation.housekeep to clear out old ressources
- b114902: only Edit-level managers can now see places left count and capacities when they are hidden
- 2aebc49: allow search for bookings in /event/:id/bookings

### Patch Changes

- Updated dependencies [89f386f]
- Updated dependencies [5880beb]
- Updated dependencies [a09feb9]
- Updated dependencies [072d7f5]
- Updated dependencies [2aebc49]
  - @churros/db@4.1.0

## 8.0.0

### Major Changes

- a451d73: remove Query.issuesByUser, Query.codeContributors, Query.issue and types related to gitlab issues
- df8fb24: Remove Mutation.kioskReload and Subscription.kioskReload
- 50ffbd7: drop type Comment, interface Commentable, fields .comments, .comment and .commentId where they exist, Mutation.{upsert,delete}Comment and remove commentId argument from fields that take it

### Minor Changes

- df8fb24: Add Query.userCandidatesCount

### Patch Changes

- 03a5a4f: gdpr exports could not be created
- 788844c: fix(ticketing): nombre de places non payées ne prend pas en compte les places sans mode de paiement choisi (closes #1254)
- 8322cc9: school-restricted events can be accessed by other school's students if some tickets are opened to them
- Updated dependencies [5b6b6ba]
- Updated dependencies [50ffbd7]
  - @churros/db@4.0.0

## 7.0.0

### Major Changes

- 4589b01: User.booking takes a `event: LocalID!` instead of `event: ID!`, and is now nullable instead of throwing an error

### Minor Changes

- 893dbc8: Add GDPR data export
- 465ebe1: dedupe profile email addresses
- 85bc631: add themes management
- 4589b01: allow tickets to be accessed via invitation links only
- 93f7dd6: allow users to set their pronouns

### Patch Changes

- 4589b01: User.booking now correctly returns the User object's booking instead of the logged-in user's
- e1262b7: upgrade dependencies
- Updated dependencies [4589b01]
- Updated dependencies [85bc631]
- Updated dependencies [e1262b7]
- Updated dependencies [93f7dd6]
  - @churros/db@3.2.0
  - arborist@0.1.2

## 6.0.0

### Major Changes

- bba3e47: change return type and argument type for Mutation.deleteArticle
- f09cd52: Change arguments for Mutation.requestEmailChange: email is now newEmail and there's an additional user argument
- 02fa1a0: Event.placesLeft and Ticket.placesLeft are now of type Capacity and not Int. Instead of -1 to represent infinity, the Capacity scalar is used

### Minor Changes

- 6e11d67: Add Bookmark.url, useful for bookmarking services
- 02fa1a0: allow hiding capacity on tickets
- f09cd52: fix and improve email change request flow (wording in email, appearance of error state, and making request creating actually work)
- 02fa1a0: show event managers inherited from group memberships
- 02fa1a0: only Edit-level managers can now see places left count and capacities when they are hidden
- aee5a3a: make repository url to the churros repo env-configurable, defaults to https://git.inpt.fr/churros/churros

### Patch Changes

- 12d9dec: fix(profile): paiement en attente sur le profil d'ae quand loggedout (closes #1176)
- eecc2c9: fix Mutation.updateGroupMember createdAt not doing anything
- Updated dependencies [02fa1a0]
  - @churros/db@3.1.0

## 5.0.1

### Patch Changes

- 3e47614: allow postgresql: protocol alongside postgres: protocol for database_url env variable

## 5.0.0

### Major Changes

- 4f87c5e: improve groups' Lydia accounts management and fix bugs
- 3fa8469: feat(shop): drop shops (shops will come back as a separate project)

### Minor Changes

- 78a786a: validate env vars before launching server

### Patch Changes

- 524ef98: don't try to sync bot accounts to ldap when logging in or updating profile/curriculum of the bot account
- Updated dependencies [cfaed6e]
- Updated dependencies [3fa8469]
  - @churros/db@3.0.0

## 4.0.1

### Patch Changes

- cc5b1b6: fix dev deps

## 4.0.0

### Major Changes

- 2360071: remove bar weeks
- ff2d33e: Change type of Mutation.checkIfBookingIsPaid to Result<Registration> instead of Boolean

### Minor Changes

- 51dec97: allow specifying groups to apply promotions on by default, add mutation to generate simpps code, fix price display on ticket page
- 4f8eb7d: rework group members UI
- d95e254: feat(profile): enlarge picture on click
- ff2d33e: Allow creating a token after OAuth2 login process for use in contexts that don't support HttpOnly cookies (such as native apps)
- 620291b: add Mutation.upsertServiceV2, deprecate Mutation.upsertService
- fc2c196: search: allow bumping result ranks depending on their resource type in Query.search, see the PUBLIC_GLOBAL_SEARCH_BUMPS env var.
- ff2d33e: Allow pushing notifications through Firebase FCM -- set the NotificationSubscription endpoint to `apns://APNS TOKEN HERE` or `firebase://ANDROID FIREBASE TOKEN HERE`, and fill out the related env variables

### Patch Changes

- fd2d1b9: fix(members): purge user session cache when changing memberships
- Updated dependencies [51dec97]
- Updated dependencies [620291b]
- Updated dependencies [51dec97]
- Updated dependencies [2360071]
  - @churros/db@2.0.0

## 3.3.1

### Patch Changes

- 3cff84f: chore(deps): upgrade dependencies
- Updated dependencies [3cff84f]
  - arborist@0.1.1
  - @churros/db@1.3.1

## 3.3.0

### Minor Changes

- 452566a: rework posts UI
- a6d103c: add mixed search

## 3.2.0

### Minor Changes

- 6815750: allow filtering logs by action
- 6815750: add mutation deduplicateBookings

### Patch Changes

- 6815750: fix(frappe): document links triggered client-side navigation when api and app are on the same domain (closes #1162)
  fix(frappe): data was sometimes loaded too late, resulting in a 404
  fix(frappe): no solutions available indicator was green
  fix(email changes): create request for target email's user, not logged in user
  fix(ticketing): duplication de billet lors de la création (closes #1150)
  fix(profile): add text to profile badges (closes #1091)
  fix(app): churro à la place de churros sur petit ecran (closes #1155)
  fix(profile): crash sometimes when getting to page (see #1157)
- 6815750: fix(registration): do not allow custom username
- 6815750: permission check for bookEvent now correctly handles beneficiaries

## 3.1.3

### Patch Changes

- d772236: chore: bump ldap7 to v1.0.12

## 3.1.2

### Patch Changes

- 238a90b: chore: bump ldap7 to v1.0.11

## 3.1.1

### Patch Changes

- 26f4a09: fix(registration): do not allow custom username

## 3.1.0

### Minor Changes

- 4175768: allow filtering through logs via get params, see commit for more info and https://www.prisma.io/docs/orm/prisma-client/queries/full-text-search

### Patch Changes

- ddf3dc0: add debug logs to canBookEvent calculation

## 3.0.1

### Patch Changes

- b4bccf3: Fix crashes when trying to create apple wallet cards on events with pictures

## 3.0.0

### Major Changes

- 975b061: make saveLydiaPhone return a mutation result instead of the user directly

### Minor Changes

- 8fef930: implement ticket counting policies
- 86f8a45: add "add to apple wallet" support for bookings
- 687fb54: fix Ticket.registrations
- 34a50bd: add mutations to move a ticket to a group

### Patch Changes

- d645d37: anyone could edit a post
- a9bbdbb: fix(ticketing): global event capacity was not taken into account
- Updated dependencies [8fef930]
  - @churros/db@1.3.0

## 2.4.2

### Patch Changes

- 0a5528f: fix cannot book any event due to obscure prisma error
- bda5164: minimum price was sent to lydia even when paying more
- Updated dependencies [01d6cd0]
- Updated dependencies [2a2cb72]
  - @churros/db@1.2.2

## 2.4.1

### Patch Changes

- 96e9d1d: fix borked migration
- Updated dependencies [96e9d1d]
  - @churros/db@1.2.1

## 2.4.0 - [YANKED]

### Minor Changes

- c3229cc: feat(ticketing): add price to csv exports in bookings (closes #1081)

### Patch Changes

- Updated dependencies [188f34d]
  - @churros/db@1.2.0

## 2.3.0

### Minor Changes

- a4871ef: feat: add Group.membership

### Patch Changes

- cf6bee2: fix permissions for modifying and deleting links related to users
- 0f65a48: fix: could not self-join groups

## 2.2.0

### Minor Changes

- 682a3b8: feat(contributions): allow marking contributions as paid when we are admin of at least one of the AEs, not all of them
- 3b34c20: feat(ticketing): add external payment method

### Patch Changes

- d5f68be: fix app crash when handover page are generated for group without president or treasurer
- Updated dependencies [3b34c20]
  - @churros/db@1.1.0

## 2.1.2

### Patch Changes

- bf11f6b: fix(signups): upsert user in ldap
- 97ca481: prevent case-only uniques in uids
- Updated dependencies [bf11f6b]
  - @churros/db@1.0.1

## 2.1.1

### Patch Changes

- e9156d7: fix cannot book ticket on event that has a zero godson limit

## 2.1.0

### Minor Changes

- b735292: allow signing up via qrcode even when signups are disabled

## 2.0.2

### Patch Changes

- fcb9951: fix cannot self join or edit group details

## 2.0.1

### Patch Changes

- 54ec422: fix generated buildinfo version
- 7888095: Fix some validation bugs around signups

## 2.0.0

### Major Changes

- a9689bd: - Separate updateUser, upsertGroup into more specific mutations (with different permission levels)
  - Expose more `canXXX` fields on types, most with a `assert: String` argument to make the field raise an error if the permission is not granted
  - Add necessary queries and mutations for new features as mentionned in the database changes section above
  - More scalars to better document & validate incoming data: URL, LooseURL, Markdown, HTML, etc.
  - Centralize handling of pictures into a single mutation `setPicture`
  - Centralize handling of links into mutations `addLinks`, `updateLink` and `deleteLink`
  - New `profile` query to get any resource that can be identified by a uid

### Patch Changes

- 60e9ac7: chore(changesets): version db and fix sync / api / app packages dependencies
- 88b63d1: chore(deps): bump ldap7 to v1.0.9
- 582adfb: prevent crashing api when mailman API can't be contacted
- Updated dependencies [60e9ac7]
- Updated dependencies [b34b81a]
  - @churros/db@1.0.0
