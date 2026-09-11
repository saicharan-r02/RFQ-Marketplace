# B2B RFQ Marketplace

A full-stack mini B2B RFQ marketplace where buyers can publish RFQs and suppliers can discover open RFQs, submit quotations, and track quotation outcomes.

## Architecture

The application is organized as a Vite + React frontend with a Node.js + Express + Prisma backend. The backend uses Socket.IO for live notifications, JWT for authentication, and Zod for validation.

The backend and the Prisma schema store the main application entities:

- User
- RFQ
- Quotation
- Notification

The UI is role-aware. Buyers can post and manage RFQs, while suppliers can browse RFQs and submit quotations.

## Tech Stack

- Frontend: React 19, Vite, Axios, React Router, Socket.IO client, lucide-react
- Backend: Node.js, Express, JWT, Socket.IO, Zod
- Database: Prisma ORM with SQLite by default
- Styling: custom React UI with Tailwind-ready styling

## Local Setup

1. Install dependencies from the workspace root:

   ```sh
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

2. Create a local environment file for the backend:

   ```sh
   cp .env.example server/.env
   ```

   Or copy the values manually into the server folder.

3. Generate Prisma client and push the schema:

   ```sh
   cd server
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

4. Start the backend:

   ```sh
   cd server
   npm run dev
   ```

5. Start the frontend:

   ```sh
   cd client
   npm run dev
   ```

6. The frontend runs on port 5173 by default and the backend runs on port 5000.

## Demo Accounts

The seed script creates these accounts:

- Buyer: `buyer@apexind.com` / `Password123!`
- Supplier 1: `supplier1@globaltech.com` / `Password123!`
- Supplier 2: `supplier2@primepack.com` / `Password123!`

## API and UI Highlights

- Buyer: create, edit, view, delete, and manage RFQs.
- Supplier: browse RFQs, submit quotations, and see previously submitted quotations.
- Buyer: accept or reject quotations received for an RFQ.
- Live notifications via Socket.IO for quotation and RFQ events.

## Deployment Notes

This repository is structured for local development and can be adapted to a production deployment by deploying the Express API and static Vite build separately.

Recommended production approach:

- Deploy the Express API to a Node-capable platform.
- Deploy the Vite frontend as a static production site.
- The safest default for this repository is SQLite for local demo work and a static Vite build on Netlify, with Express hosted on Render or any Node-capable platform.

A concrete production mapping for this repo is:

- Backend: Render
- Frontend: Netlify
- Database: keep SQLite locally, or migrate Prisma datasource to a hosted SQL provider later

The existing Prisma datasource currently points to a local SQLite file in the Prisma schema. That is fine for this assignment and demo workflows, but a production deployment should move to a hosted database and update the Prisma datasource URL.

## Assumptions and Limitations

- The app currently uses the SQLite demo database stored in the Prisma folder.
- Socket.IO uses the JWT token passed on socket authentication.
- The app treats the RFQ status cycle as OPEN, AWARDED, CLOSED, and PENDING quotations.
- No payment or advanced approval workflow is implemented.
