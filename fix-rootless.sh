#!/usr/bin/env bash

podman-compose -f docker-compose.yml -f docker-compose-dev.yml down || true

podman ps -a --format '{{.ID}} {{.Names}} {{.Status}}'

podman rm -f captions-back captions-website captions-db captions-redis 2>/dev/null || true

systemctl --user restart podman
