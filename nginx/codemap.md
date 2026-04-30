# nginx/

## Responsibility
Nginx reverse proxy configuration for local development. Routes requests between the Next.js frontend (port 3000) and PocketBase backend (port 8090) and handles HTTPS termination with self-signed certificates.

## Files
- `nginx.conf` — Proxy rules, SSL termination, upstream definitions
- `certs/` — Self-signed SSL certificates for local dev HTTPS
