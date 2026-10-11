#!/bin/bash
set -e
VERSION="$(bun ./scripts/get-package-version.js)"
VERSION="$VERSION" bun -e 'const p=await Bun.file("package.json").json(); p.version=process.env.VERSION; await Bun.write("package.json",JSON.stringify(p,null,2)+"\n")'
