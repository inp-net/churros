---
'@churros/app': patch
---

fix(app): remove global top progress bar (closes #1123)
fix(app): don't crash when trying mutation with invalid date
fix(app): accept null for data on CardBooking
fix(ticketing/scan): surface error when camera not found on event scanning view (closes #1127)
fix(app): check for navigator.vibrate support everywhere (closes #1121)
fix(app): polyfill URL.canParse and Array#toReversed
fix(social links): don't use named capture groups (closes #1122)
fix(app): modaldialog close click handler: use e.currenttarget instead of element (closes #1126)
fix(app): buttonlike: cannot read properties of null (reading 'likes') (closes #1124)