#!/usr/bin/env bash
# Assembles the publishable static site into ./dist (keeps node_modules etc. out).
set -u
rm -rf dist
mkdir -p dist
for item in index.html guitar.html workshop.html blog.html post.html passport.html \
            admin css js assets content robots.txt; do
  [ -e "$item" ] && cp -R "$item" dist/
done
echo "assemble-dist: done -> $(du -sh dist | cut -f1)"
