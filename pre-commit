#!/bin/bash
files=$(git diff --cached --name-only | grep '\.jsx\?$')

# Prevent ESLint help message if no files matched
if [[ $files = "" ]] ; then
  exit 0
fi

failed=0
for file in ${files}; do
  git show :$file | eslint --stdin --stdin-filename $file
  if [[ $? != 0 ]] ; then
    failed=1
  fi
done;

if [[ $failed != 0 ]] ; then
  echo "ESLint check failed, commit denied"
  exit $failed
fi
