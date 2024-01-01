import { parser as parseChangelog } from "keep-a-changelog";
import { readFileSync } from "fs";
import path from "path";
import gitRootPath from "git-root-path";

const changelog = parseChangelog(readFileSync(path.join(gitRootPath(), "packages/app/CHANGELOG.md"), "UTF-8"))

console.log(changelog)
