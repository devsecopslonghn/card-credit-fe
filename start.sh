#!/bin/sh
set -eu
node /app/server.js &
exec nginx -g 'daemon off;'
