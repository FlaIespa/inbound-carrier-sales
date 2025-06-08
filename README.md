# Inbound Carrier Sales

A next-generation inbound voice agent and dashboard for carrier engagement, built on the HappyRobot platform. This project streamlines the process of verifying carrier MC numbers, searching available loads, negotiating rates, and extracting call outcomes and carrier sentiment, all surfaced in a real-time dashboard.

---

## Table of Contents

* [Features](#features)
* [Architecture](#architecture)
* [Prerequisites](#prerequisites)
* [Installation](#installation)
* [Configuration](#configuration)
* [Running the Project](#running-the-project)
* [Troubleshooting](#troubleshooting)
* [API Endpoints](#api-endpoints)
* [Folder Structure](#folder-structure)
* [Environment Variables](#environment-variables)

---

## Features

* **Carrier Verification**: Collect and verify USDOT MC numbers via the FMCSA QCMobile API.
* **Load Search**: Query available loads by origin/destination and present detailed load data.
* **Interactive Negotiation**: Handle carrier interest, accept counter-offers up to three rounds, and transfer to a human sales rep upon agreement.
* **Data Extraction**: Classify call outcomes, capture agreed rates, and analyze carrier sentiment.
* **Dashboard**: Real‑time metrics and tables for calls, loads, outcomes, offers, and sentiment, built with Next.js and React.

---

## Folder Structure / Architecture

```
├── dashboard/          # Next.js frontend application
│   ├── src/app        # Next 13 app directory
│   │   ├── dashboard  # Dashboard page & subcomponents
│   │   ├── api        # serverless API routes
│   │   └── page.tsx   # Root landing page
│   ├── components/ui # Shared UI primitives (Card, Table, Button, etc.)
│   └── lib           # supabaseClient & utility functions
│
└── server/            # Node.js backend & webhook handler
    ├── config/       # Global configuration (API keys, ports)
    ├── controllers/  # Orchestrate requests & responses
    ├── routes/       # Route definitions
    ├── services/     # Business logic (fmCSA, loadSearch, callStates)
    └── utils/        # Helper modules (supabaseClient, index.js)
```

---

## Prerequisites if running locally

* Node.js v18+ and npm
* Supabase Environment Variables
* MC Number
* FMCSA API Key (for MC number verification)
* Happy Robot API Key 
* Happy Robot Org ID 


---

## Installation 

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/inbound-carrier-sales.git
   cd inbound-carrier-sales
   ```

2. **Install dependencies**

   * Dashboard:

     ```bash
     cd dashboard
     npm install
     ```

   * Server:

     ```bash
     cd server
     npm install
     ```

---

## Configuration

### Environment Variables

Create environment variable files in each directory:

* **Dashboard** (`dashboard/.env.local`)

  ```env
  NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
  ```

* **Server** (`server/.env`)

  ```env
  FMCSA_API_KEY=<your-fmcsa-api-key>
  MY_SECRET_API_KEY=<webhook-authentication-key>
  SUPABASE_URL=<your-supabase-url>
  SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
  PORT=4000
  ```

---

## Running the Project

### 1. Dashboard (Next.js)

```bash
cd dashboard
npm run dev
```
* Available at (deployed): `https://inbound-carrier-sales.vercel.app/`
* Available at (locally): `http://localhost:3000`

### 2. Server (Node.js)

```bash
cd server
npm run dev   # or: npm start
```
* Listens on: `https://inbound-carrier-sales-production.up.railway.app/`
* Listens on: `http://localhost:4000/webhook`

---

## Troubleshooting

If you have any issues, please reach out at flavia.iespa@uni.minerva.edu. 

2. **Add Supabase to production deps**
   From your repo root, run:

   ```bash
   cd server
   npm install @supabase/supabase-js --save
   ```

   This moves it into `"dependencies"`.

   Commit the updated `package.json` and `package-lock.json`.

3. **Rebuild & rerun**
   Back at the repo root:

   ```bash
   docker rm -f happyrobot-api            # remove the old container
   docker build -f server/Dockerfile -t happyrobot-api:latest ./server
   docker run -d \
     --name happyrobot-api \
     -p 4001:4000 \
     --env-file .env \
     happyrobot-api:latest
   ```

4. **Verify**

   ```bash
   docker ps                              # should show happyrobot-api up
   docker logs -f happyrobot-api          # no more “Cannot find package” errors
   curl http://localhost:4001      # should return {"status":"ok"}
   ```

Let me know if that gets your container to stay running!

---

## API Endpoints

| Endpoint                 | Method | Description                                   |
| ------------------------ | ------ | --------------------------------------------- |
| `/webhook`               | POST   | Receives call events from HappyRobot webhook. |
| `/api/mc-number`         | POST   | Verifies a carrier MC number via FMCSA.       |
| `/api/load-details`      | POST   | Searches loads by origin/destination.         |
| `/api/final-offer`       | POST   | Processes counter-offer logic.                |
| `/api/call-outcome`      | POST   | Records call outcome and metrics.             |
| `/api/carrier-sentiment` | POST   | Analyzes and stores sentiment.                |

---


## Environment Variables

See the [Configuration](#configuration) section above for details on required variables.
In case you are running the project locally, please reach out for the .env variables used in this project so I can send them securely. 