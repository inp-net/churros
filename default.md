Closes #[issue number]

<!--
Once the PR is ready for review, add the `review:ready` label.
-->

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
- [ ] If I removed fields from a database table (prisma model) that has a `search Unsupported("tsvector")` field, I also updated the trigger function that computes this tsvector (see `fulltextsearch.sql`: copy-paste the `CREATE OR REPLACE FUNCTION update_TABLE_search()` statement, removing the deleted fields from its implementation
- [ ] If relevant, I've updated the technical documentation:
  - [ ] [The wiki](https://git.inpt.fr/churros/wiki)
  - [ ] The various CONTRIBUTING.md files
