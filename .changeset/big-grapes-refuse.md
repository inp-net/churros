---
'@churros/api': patch
'@churros/app': patch
---

fix(frappe): document links triggered client-side navigation when api and app are on the same domain (closes #1162)
fix(frappe): data was sometimes loaded too late, resulting in a 404
fix(frappe): no solutions available indicator was green
fix(email changes): create request for target email's user, not logged in user
fix(ticketing): duplication de billet lors de la création (closes #1150)
fix(profile): add text to profile badges (closes #1091)
fix(app): churro à la place de churros sur petit ecran (closes #1155)
fix(profile): crash sometimes when getting to page (see #1157)
