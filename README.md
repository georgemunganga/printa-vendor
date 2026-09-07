# Printa Webapp

## Overview

This repository powers the Printa dashboard, checkout flows, and public marketing pages backed by Vite, React, and Tailwind.

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the dev server with hot reload:
   ```bash
   npm run dev
   ```
3. Run against the production API through the Vite proxy:
   ```bash
   npm run dev:local-test
   ```
4. Build for production:
   ```bash
   npm run build
   ```

The app reads `VITE_API_BASE_URL`. Use `https://api.printa.co.zm` for deployed builds. For local integration testing, use `/` with `npm run dev:local-test`; Vite proxies `/api`, `/healthz`, and `/readyz` to the production API so browser CORS does not block testing.

This project requires Node 20 or newer. On the current Printa server, the working Node 22 binary is available at `/opt/hermes-node/bin/node`.

## Testing & linting

- `npm run lint` checks the code style and TypeScript rules.
- `npm run test:e2e` runs Playwright smoke tests against the local-test dev server.

The current Playwright suite verifies that the frontend loads, the Vite proxy reaches the production API readiness endpoint, and protected vendor endpoints reject unauthenticated requests. Auth signup/OTP tests should use a controlled test mailbox or backend test OTP hook before they are automated.

## Deployment

Any static hosting provider that supports Vite assets works (Netlify, Vercel, etc.). Build with `npm run build` and deploy the contents of `dist`.

## Tech stack

- Vite
- React 18
- TypeScript
- Tailwind CSS with shadcn/ui components
*** End Patch**
