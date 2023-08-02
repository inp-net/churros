# Import des anciennes données

1. Se connecter sur dnepr
2. `slapcat > dump.ldif`
3. Récupérer le .ldif (par scp)
4. `./ldif-to-json.py` (installer avec pip: ldif et parse)
5. `yarn tsc --target es2022 --lib es2023,DOM --allowSyntheticImports --module es2022 import-old-data.ts`
6. `yarn node import-old-data.js`
