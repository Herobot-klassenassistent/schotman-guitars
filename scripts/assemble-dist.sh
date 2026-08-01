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

# the compiled TinaCMS editor — only ship it if it's a real PRODUCTION build.
# (a failed/dev build leaves an admin/index.html that points at localhost:4001)
if [ -f admin/index.html ] && ! grep -q "localhost:4001" admin/index.html; then
  cp -R admin dist/
  echo "assemble-dist: included /admin editor (production build)"
else
  echo "assemble-dist: skipped /admin (no valid production build — check Tina Cloud connection)"
fi

echo "assemble-dist: done -> $(du -sh dist | cut -f1)"
