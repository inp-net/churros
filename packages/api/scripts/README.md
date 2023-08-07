# Import des anciennes données

Tout se passe dans le répertoire `packages/api/scripts`.

1. Se connecter sur pma.inpt.fr
1. Récupér un export de la bdd "portail" contenant au moins les tables `auth_user` et `club_club`
1. Le sauvegarder en `data.json`
1. Se connecter sur dnepr
1. `slapcat > dump.ldif`
1. Récupérer le .ldif (par scp)
1. `./ldif-to-json.py` (installer avec pip: ldif et parse)
1. `yarn tsc --target es2022 --lib es2023,DOM --allowSyntheticImports --module es2022 import-old-data.ts`
1. `yarn node import-old-data.js`
