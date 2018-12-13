#!/bin/bash

#####
# This Script creates the changelog almost automatically.
#####

if [ $# -ne 2 ]; then
  echo "Usage: $0 <Previous_Version> <Current_Version>"

  exit 1
fi

printf " ️  Generating Changelog File...\n"
bash generate_release_markdown_file.sh $1 $2

printf " ️  Getting Merge Commits..\n"
bash get_merge_commits.sh $1 $2
bash format_messages.bash merge_commits_of_release.txt formatted_messages.txt

printf "🛀 Please clean up the Merge Commits!\n"
code formatted_messages.txt -w
bash sort_and_format_merge_commits.sh

printf "📋 Merge Commits have been copied to clipboard.\n"
printf "✏️  Please paste the Merge Commits into the 'Full Changelog' section!\n"
code releasenotes_$2.md -w
printf " ️ Getting Closed Issues..\n"
GITHUB_AUTH="" bash get_fixed_issues.sh
printf "🛀 Please clean up the Closed Issues!\n"
code closed_issues -w
bash format_messages.bash closed_issues formatted_closed_issues.txt
printf "📋 Closed Issues have been copied to Clipboard.\n"
cat formatted_closed_issues.txt | pbcopy
printf "✏️  Please paste the Closed Issues in the 'Fixed Issues' section!\n"
code releasenotes_$2.md -w
printf "  Release Notes have been created!!!\n"
code releasenotes_$2.md -w
printf "👋 Bye Bye!\n"
