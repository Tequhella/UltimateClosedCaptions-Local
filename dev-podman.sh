#!/usr/bin/env bash
podman-compose -f docker-compose.yml -f docker-compose-dev.yml up --build
