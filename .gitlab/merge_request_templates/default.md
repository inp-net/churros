Closes #[issue number]

<!--
Once the MR is ready for review, add the `review:ready` label.

If your MR is not finished at all, to run less jobs in CI, put in in Draft. This will prevent running builds.

If you changed native code:

- Add labels `android` and/or `ios` before opening the MR. This will make the CI build APKs and/or IPAs.
  (If you don't, a bot will do it for you, but the first pipeline run will not take the labels into account.)

-->

You can build yourself a development APK if you want to develop or test within the native app, but don't want to run Android Studio:

1. Create a free account on a localhost tunnelling service like ngrok (https://ngrok.com/)
2. Create a tunnel to your localhost:5173 (with ngrok: `ngrok http 5173`)
3. Start your development server (for now, the API used is the production API), setting the `CAPACITOR_DEVSERVER` env variable to the tunnel's URL:
   > CAPACITOR_DEVSERVER=https://my-tunneled-url yarn @app dev
4. Run the `build:app-with-native-debug` job, with the variable **`REMOTE_DEVSERVER`** set to the tunnel's URL
   To do this, click on the job name, not the play button directly. You can then set variables and click "Run job"

Checks before adding `review:ready`:

- [ ] My branch is up-to-date with upstream's main branch, at the latest tag or more recent (this prevents, amongst other things, creating prisma migrations dated in the past relative to the current deployed migrations)
- [ ] I've added changesets if necessary (see the comment by the changeset bot below)
- [ ] If some commits were made without commit lints (`--no-verify` flag), I ran `yarn lintfix` and `yarn format` afterwards
- [ ] I've tested the changes locally
- [ ] If I added / removed environment variables:
  - [ ] I've updated the `.env.example` file
  - [ ] I've updated the `packages/api/src/env.ts` file
  - [ ] I opened a MR to inp-net/k8s to update the production environment variables (can be done by a core team member if the new variable is a secret)
- [ ] If relevant, I added database seeding data to by modifying `packages/db/seed/index.ts`
- [ ] If I removed fields from a database table (prisma model), I also updated trigger functions that computes fulltext search vectors (fields with the `Unsupported("tsvector")` type in the prisma schema): see `fulltextsearch.sql`, copy-paste the `CREATE OR REPLACE FUNCTION update_TABLE_search()` statement, removing the deleted fields from its implementation, for every `TABLE` that uses your now-deleted field in its search tsvector update trigger function
- [ ] If relevant, I've updated the technical documentation:
  - [ ] [The wiki](https://git.inpt.fr/churros/wiki)
  - [ ] The various CONTRIBUTING.md files
