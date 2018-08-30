#!/bin/bash

#####
# This Script cleans up all merge commits by:
#   * Replacing all utf8 - Emoji Characters with their text variants
#####

# If this script gets called without an argument, exit.
if [[ $# -ne 1 ]]; then
  echo 'Insufficient arguments.'
  exit 1;
fi

# Declare an array to store the processed lines
declare -a outLines

# loop over all lines
while read line; do

  currentOutLine="$line"

  # If a line contains a merge commit mark, remove it.
  if [[ $line =~ (🔀)|(\:twisted\_rightwards\_arrows\:) ]]; then
    currentOutLine=${currentOutLine/\:twisted\_rightwards\_arrows\:\ }
    currentOutLine=${currentOutLine/🔀}
  fi

  # Replace any emojis with their text variant.
  # If the emoji is not conform to our emoji guide,, it will be ignored.
  # You can find the guide here:
  # https://github.com/process-engine/bpmn-studio/blob/develop/.github/PULL_REQUEST_TEMPLATE.md
  currentOutLine=${currentOutLine/🐛/":bug:"}
  currentOutLine=${currentOutLine/🔧/":wrench:"}
  currentOutLine=${currentOutLine/💄/":lipstick:"}
  currentOutLine=${currentOutLine/⬇️/":arrow_down:"}
  currentOutLine=${currentOutLine/⬆️/":arrow_up:"}
  currentOutLine=${currentOutLine/🎨/":art:"}
  currentOutLine=${currentOutLine/⚡️/":zap:"}
  currentOutLine=${currentOutLine/🎉/":tada:"}
  currentOutLine=${currentOutLine/🚨/":rotating_light:"}
  currentOutLine=${currentOutLine/📦/":package:"}
  currentOutLine=${currentOutLine/✨/":sparkles:"}
  currentOutLine=${currentOutLine/♻️/":recycle:"}
  currentOutLine=${currentOutLine/🔖/":bookmark:"}
  currentOutLine=${currentOutLine/🔥/":fire:"}
  currentOutLine=${currentOutLine/✅/":white_check_mark:"}

  outLines+=("$currentOutLine")

done <$1

printf "%s\n" "${outLines[@]}" > ordered_merge_commits.txt
