#!/bin/sh
# Generate a self-signed cert for local network use.
# Usage: ./generate.sh [IP]
# Default IP: 192.168.20.105

IP="${1:-192.168.20.105}"
DIR="$(cd "$(dirname "$0")" && pwd)"

openssl req -x509 -nodes -days 3650 \
  -newkey rsa:2048 \
  -keyout "$DIR/key.pem" \
  -out "$DIR/cert.pem" \
  -subj "/CN=$IP" \
  -addext "subjectAltName=IP:$IP,IP:127.0.0.1,DNS:localhost"

echo "Generated cert.pem and key.pem for $IP"
