# @churros/app

## 2.9.0

### Minor Changes

- 6815750: allow filtering logs by action

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

## 2.8.2

### Patch Changes

- 3f7d732: fix: diplay correct root actions when not connected
- 69f6446: fix: hide graduation year if not in major

## 2.8.1

### Patch Changes

- 26f4a09: fix(registration): do not allow custom username

## 2.8.0

### Minor Changes

- 4175768: allow filtering through logs via get params, see commit for more info and https://www.prisma.io/docs/orm/prisma-client/queries/full-text-search

## 2.7.0

### Minor Changes

- 8fef930: implement ticket counting policies
- 86f8a45: add "add to apple wallet" support for bookings
- 975b061: add setting to change saved lydia phone
- 34a50bd: add UI to manage ticket groups

### Patch Changes

- 993f52d: fix(app): remove global top progress bar (closes #1123)
  fix(app): don't crash when trying mutation with invalid date
  fix(app): accept null for data on CardBooking
  fix(ticketing/scan): surface error when camera not found on event scanning view (closes #1127)
  fix(app): check for navigator.vibrate support everywhere (closes #1121)
  fix(app): polyfill URL.canParse and Array#toReversed
  fix(social links): don't use named capture groups (closes #1122)
  fix(app): modaldialog close click handler: use e.currenttarget instead of element (closes #1126)
  fix(app): buttonlike: cannot read properties of null (reading 'likes') (closes #1124)
- 7e8f072: make ticket payment modal more robust with regards to lydia payments
- 7c8aafe: link to event was lost on post save

## 2.6.0

### Minor Changes

- 96e9d1d: variable prices support

## 2.5.1 - [YANKED]

### Patch Changes

- dc84fbe: fix(ticketing): could set godsons even when godson limit was diabled
- 92167a6: fix(ticketing): variable price input was enabled on price change
- 12337d6: fix pwa instabillity issues (maybe)

## 2.5.0

### Minor Changes

- 8afacba: feat(app): sentry support

## 2.4.1

### Patch Changes

- 0f65a48: fix: could not self-join groups
- 992fa2d: fix other ticket link color
- 6558e15: fix calendar bug showing day of the week (1 - 7) instead of day of the month (1 - 31)

## 2.4.0

### Minor Changes

- 3b34c20: feat(ticketing): add external payment method
- bc65f15: feat(bookings): show booking links at the end of the payment journey

## 2.3.2

### Patch Changes

- f4d6f2e: send 404 on /uid.png when picture is not set
- daf01e1: improve wording on ticket beneficiaries (closes #1077)
- 5df3d35: image on picture edit forms was stretched
- 989388c: PillLink on event look like they have social=true (closes #1079)

## 2.3.1

### Patch Changes

- 0a2b8da: make welcome page load and fix buttons

## 2.3.0

### Minor Changes

- 7b4d1d6: fix pickmajor (by hardcoding exclusion of the inp majors group for now), display school of quicksignup first
- d64bbc9: remove forms, add signups to backrooms

## 2.2.0

### Minor Changes

- c540e85: add button to download group handover on group profile

### Patch Changes

- 5647f95: fix cannot logout when logged-in via oauth but authed_via was not set

## 2.1.0

### Minor Changes

- 86413c4: Planning view now goes up to a month
- 28b9678: disable publish later on articles for now

### Patch Changes

- 6970b6a: force reload static CSS
- 54ec422: fix generated buildinfo version
- 7888095: Fix some validation bugs around signups

## 2.0.0

### Major Changes

- a9689bd: Refresh UI

### Patch Changes

- 60e9ac7: chore(changesets): version db and fix sync / api / app packages dependencies
