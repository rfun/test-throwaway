#!/usr/bin/env bash
# Generates a self-signed cert that is already expired (for the tls-expired chaos mode).
set -euo pipefail
mkdir -p .certs
faketime '3 days ago' openssl req -x509 -newkey rsa:2048 -nodes -days 1 \
  -keyout .certs/key.pem -out .certs/cert.pem -subj "/CN=127.0.0.1" \
  -addext "subjectAltName=IP:127.0.0.1"
