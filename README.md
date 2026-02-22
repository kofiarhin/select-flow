# SelectFlow

Production-ready MERN application for photographer--client image
proofing, selection, editing workflow, and final delivery.

Photographer uploads originals → Client selects → Photographer downloads
selected ZIP → Photographer uploads finals → Client downloads final ZIP.

------------------------------------------------------------------------

## Tech Stack

### Frontend

-   React (Vite)
-   React Router
-   TanStack Query
-   Redux Toolkit (UI state only)
-   Axios
-   SCSS (BEM-style global classes)

### Backend

-   Node.js
-   Express
-   MongoDB (Mongoose)
-   Multer (uploads)
-   Sharp (thumbnails + previews)
-   Archiver (ZIP downloads)
-   JWT (authentication)
-   bcrypt (password hashing)
-   Helmet + CORS
-   Rate limiting
-   AWS SDK v3 (S3 support)
-   Pino (structured logging)

### Testing

-   Jest + Supertest (API integration)
-   Playwright (End-to-End)

------------------------------------------------------------------------

# Core Features

## Photographer (Authenticated)

-   Register / Login
-   Create and manage projects
-   Upload ORIGINAL image folder (max 1GB enforced)
-   Automatic preview generation
-   Share unique client link
-   View client selections
-   Download selected ORIGINALS as ZIP
-   Upload FINAL edited images
-   Deliver FINAL images to client

## Client (No Authentication)

-   Access project via secure tokenized link
-   View preview gallery
-   Select/deselect images
-   Save selection
-   After FINAL_DELIVERED → view final gallery
-   Download all FINAL images as ZIP

------------------------------------------------------------------------

# Project Lifecycle

Each project moves sequentially:

-   `AWAITING_SELECTION`
-   `SELECTION_RECEIVED`
-   `EDITING`
-   `FINAL_DELIVERED`

------------------------------------------------------------------------

# Folder Structure

    selectflow/
    ├── server/
    ├── client/
    ├── e2e/
    ├── docker-compose.yml
    ├── README.md

------------------------------------------------------------------------

# Environment Variables

## Server (.env)

    PORT=5000
    NODE_ENV=development

    MONGO_URI=mongodb://localhost:27017/selectflow

    JWT_SECRET=your_super_secure_secret
    JWT_EXPIRES_IN=7d

    STORAGE_DRIVER=local
    LOCAL_STORAGE_PATH=./storage

    AWS_REGION=
    AWS_ACCESS_KEY_ID=
    AWS_SECRET_ACCESS_KEY=
    AWS_BUCKET_NAME=

    MAX_UPLOAD_SIZE=1073741824

## Client (.env)

    VITE_API_URL=http://localhost:5000

------------------------------------------------------------------------

# Running Locally

## Backend

``` bash
cd server
npm install
npm run dev
```

## Frontend

``` bash
cd client
npm install
npm run dev
```

Frontend → http://localhost:5173\
API → http://localhost:5000

------------------------------------------------------------------------

# Testing

## Run Backend Tests

``` bash
cd server
npm run test
```

Includes: - Auth tests - Project creation tests - Selection logic
tests - ZIP download tests

## Run E2E Tests

``` bash
npm run test:e2e
```

E2E Scenarios Covered:

1.  Photographer registers and logs in
2.  Photographer creates project
3.  Photographer uploads originals
4.  Client opens gallery and selects images
5.  Photographer downloads selected ZIP
6.  Photographer uploads final images
7.  Client downloads final ZIP
8.  Security checks:
    -   Client cannot access originals
    -   Invalid token rejected
    -   Disallowed file type rejected
    -   Upload limit enforced

------------------------------------------------------------------------

# File Storage

## Local Mode (Default)

    /storage
      /originals/{projectId}/
      /previews/{projectId}/
      /finals/{projectId}/

## S3 Mode

Set:

    STORAGE_DRIVER=s3

Uploads and downloads use AWS SDK v3 with secure access.

------------------------------------------------------------------------

# Security

-   JWT-based authentication
-   Password hashing with bcrypt
-   Secure client access token (crypto random)
-   File type validation
-   Path traversal prevention
-   Filename sanitization
-   Rate limiting on:
    -   Auth endpoints
    -   Upload endpoints
-   Strict project ownership validation
-   Clients never access original files
-   Helmet security headers enabled

------------------------------------------------------------------------

# API Overview

## Auth

    POST /api/auth/register
    POST /api/auth/login
    GET  /api/auth/me

## Projects

    POST   /api/projects
    GET    /api/projects
    GET    /api/projects/:id
    PATCH  /api/projects/:id/status

## Uploads

    POST /api/projects/:id/upload/originals
    POST /api/projects/:id/upload/finals

## Client Gallery

    GET  /api/gallery/:clientAccessToken
    POST /api/gallery/:clientAccessToken/selection

## Downloads

Photographer:

    GET /api/projects/:id/download/selected

Client:

    GET /api/gallery/:clientAccessToken/download/finals

------------------------------------------------------------------------

# MVP Success Criteria

-   Photographer can create project
-   Photographer can upload images
-   Client can select images
-   Photographer can download selected ZIP
-   Photographer can upload finals
-   Client can download final ZIP
-   All tests pass

------------------------------------------------------------------------

SelectFlow eliminates email-based proofing chaos and creates a
structured, professional workflow for photographers and clients.
