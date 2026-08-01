#!/usr/bin/env bash
# Assembles the publishable site into ./dist (keeps node_modules etc. out of the deploy).
# Runs after `tinacms build` (which outputs the editor into ./admin).
set -u
rm -rf dist
mkdir -p dist

# static site files
for item in index.html guitar.html workshop.html blog.html post.html passport.html \
            css js assets content robots.txt; do
  [ -e "$item" ] && cp -R "$item" dist/
done

# the compiled TinaCMS editor (present only when Tina env vars are set)
if [ -d admin ]; then
  cp -R admin dist/
  echo "assemble-dist: included /admin editor"
else
  echo "assemble-dist: no /admin (Tina build skipped — set TINA env vars)"
fi

echo "assemble-dist: done -> $(du -sh dist | cut -f1)"
