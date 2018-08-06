INPUT=merge_commits_of_release

if [[ ! -e "$INPUT" ]]; then
  echo "Input file $INPUT does not exist."
  exit 1
fi

cat $INPUT | sort -k2 | xargs -I % echo "- %" | pbcopy
