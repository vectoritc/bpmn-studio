# Generate Release Changelog

Follow this guide to generate the changelog for a new BPMN-Studio release.

## Prerequisite

In order to execute the `get_fixed_issues.sh` script, you need to
install the tool `jq`. On macOS this can be done by running

```bash
brew install jq
```

## Create a New Markdown File to the Release

This will create a `releasenotes_<this release>.md` file in your current
working directory.

```bash
bash generate_release_markdown_file.sh <release before this release> <this release>
```

Example:

```bash
bash generate_release_markdown_file.sh v4.0.0 v4.0.1
```

## Get the Merge Commits for the Release

This will create a `merge_commits_of_release.txt` file in your current working
directory.

```bash
bash get_merge_commits.sh <release before this release> <this release>
```

Example:

```bash
bash get_merge_commits.sh v4.0.0 v4.0.1
```

## Format Commit Messages

This will
* Remove all Merge Commit markers such as 🔀  or `:twisted_rightwards_arrows:`
  inside the commit messages
* Replace all emojis with their text variants (example: ✨ will be replaced to `:sparkles:`)

You can call this script like so:

```bash
bash format_commit_messages <filename>
```

Whereas `filename` is the name of the generatef file, which contains
the merge commits and the corresponding messages. Per default, this file
should name like _merge_commits_of_release.txt_.

## Cleanup Merge Commits

Edit `merge_commits_of_release.txt` in an editor for your choice:

- Remove any merge commits into feature branches.
- Remove empty, reverted and version bump commits.
- For generic merge commits use the PR title.

**Cleanup Examples:**

| Before                                                                                          | After                                                               |
|-------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| `07fdf3a9 Merge branch 'develop' into feature/fix_undefined_route_params`                       | -                                                                   |
| `40539005 Merge pull request #719 from process-engine/feature/fix_undefined_route_params`       | `:bug: Fix undefined route params` (PR title is used)               |

## Sort and Format Merge Commits

This script will read from the `merge_commits_of_release.txt` file. The script will
copy a sorted and formatted list of the commits into your clipboard.

```bash
bash sort_and_format_merge_commits.sh
```

The script will leave it's result in your clipboard; paste (CMD+v) the
contents of your clipboard into the section `Full Changelog` of the release
notes file.

## Get Fixed Issues

This script will read from the `merge_commits_of_release.txt` file. It will extract
all issues fixed in the release. It will also generate a neat looking issue list
using the issue title. To fulfill this task the script needs access to the
GitHub API. The result of the will be saved to `closed_issues` in your current
working directory.

```bash
GITHUB_AUTH="USERNAME:TOKEN" bash get_fixed_issues.sh
```

## Cleanup Fixed Issues

Edit `closed_issues` in an editor for your choice. Perform the same cleanup steps
as described in [Cleanup merge commits](#cleanup-merge-commits).

After this step paste the contents of `closed_issues` into the section `Fixed
Issues` of the release notes file.

## Update Other Sections

Now go ahead and update the other sections of the release notes file. Once
you are done, copy and paste the contents of the file into the GitHub release
editor.
