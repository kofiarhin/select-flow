# SelectFlow

MERN MVP for photographer-client proofing workflow.

## Monorepo
- `/server` Express API
- `/client` React (Vite)
- `/e2e` Playwright tests

## Setup
1. Copy env files:
```bash
cp .env.example .env
cp client/.env.example client/.env
```
2. Install dependencies:
```bash
npm install
```
3. Run locally:
```bash
npm run dev
```
- API: `http://localhost:5000`
- Client: `http://localhost:4000`

## Docker
```bash
docker-compose up --build
```

## Scripts
- `npm run dev` start server + client
- `npm run test` run Jest/Supertest with coverage
- `npm run test:e2e` run Playwright e2e tests

## RAW preview strategy
RAW uploads (`CR2/NEF/ARW/DNG`) are preserved as originals and preview JPEGs are extracted using `dcraw -e -c` + `sharp`.
`server/Dockerfile` installs `dcraw` for Linux CI/container parity.

## Security
- JWT auth for photographer
- unguessable client token (`crypto.randomBytes(32)`)
- file extension allow-list validation
- upload rate limiting + auth rate limiting
- secure asset proxy routes (clients only get previews/finals)
- 1GB upload cap via multer `limits.fileSize`

## API
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id/status`
- `POST /api/projects/:id/upload/originals`
- `POST /api/projects/:id/upload/finals`
- `GET /api/gallery/:clientAccessToken`
- `POST /api/gallery/:clientAccessToken/selection`
- `GET /api/projects/:id/download/selected`
- `GET /api/gallery/:clientAccessToken/download/finals`
