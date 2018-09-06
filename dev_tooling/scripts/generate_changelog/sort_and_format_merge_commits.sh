 #!/bin/bash

INPUT="formatted_messages.txt"

if [[ ! -e "$INPUT" ]]; then
  echo "Input file $INPUT does not exist."
  exit 1
fi

cat $INPUT | sort -k2 | xargs -I % echo "- %" | pbcopy
