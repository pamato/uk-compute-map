#!/usr/bin/env bash

set -euo pipefail

mkdir -p public/tiles
curl -L "https://build.protomaps.com/20250401.pmtiles?bbox=-8.7,49.8,1.8,61.0" \
  -o public/tiles/uk.pmtiles

du -h public/tiles/uk.pmtiles
