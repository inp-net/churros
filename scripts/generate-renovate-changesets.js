const { execSync } = require("child_process");
const { readFileSync, writeFileSync, existsSync, mkdirSync } = require("fs");
const path = require("path");

// Helper to execute a shell command and return output as a trimmed string
function exec(command) {
    return execSync(command, { encoding: "utf-8" }).trim();
}

// Create .changeset directory if it doesn't exist
const changesetDir = path.resolve(".changeset");
if (!existsSync(changesetDir)) {
    mkdirSync(changesetDir);
}

// Get the latest tagged commit
const latestTag = exec("git describe --tags --abbrev=0");

// Get all merge commits from renovate branches until the latest tagged commit
const mergeCommits = exec(
    `git log ${latestTag}..HEAD --merges --pretty=format:'%H' --grep='renovate/'`
).split("\n");

for (const commitHash of mergeCommits) {
    if (!commitHash.trim()) continue;

    // Extract the branch name from the merge commit's message
    const branchName = exec(
        `git show -s --format='%b' ${commitHash} | head -n 1`
    ).replace(/^renovate\//, "").trim();

    // Create a new changeset file
    const changesetFile = path.join(changesetDir, `${branchName}.md`);
    writeFileSync(changesetFile, "---\n", { encoding: "utf-8" });

    // Get the package.json files changed in the merge commit
    const changedFiles = exec(
        `git diff ${commitHash}~1 ${commitHash} --name-only`
    )
        .split("\n")
        .filter(file => file.endsWith("package.json"));

    // Process each package.json file to extract the package name
    for (const pkgFile of changedFiles) {
        if (pkgFile.trim()) {
            const pkgPath = path.resolve(pkgFile);
            const pkgJson = JSON.parse(readFileSync(pkgPath, { encoding: "utf-8" }));
            const pkgName = pkgJson.name;
            writeFileSync(changesetFile, `${pkgName}: patch\n`, {
                encoding: "utf-8",
                flag: "a",
            });
        }
    }

    // Append the YAML frontmatter closing
    writeFileSync(changesetFile, "---\n\n", { encoding: "utf-8", flag: "a" });

    // Append the original commit message
    const originalMessage = exec(
        `git log -1 --pretty=%B ${commitHash} | head -n 1`
    ).trim();
    writeFileSync(changesetFile, `${originalMessage}\n`, {
        encoding: "utf-8",
        flag: "a",
    });


}