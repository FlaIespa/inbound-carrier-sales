# Inbound Carrier Sales
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

  * [1. Dashboard (Next.js)](#1-dashboard-nextjs)
  * [2. Server (Node.js / Express)](#2-server-nodejs--express)
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

## Architecture

```
├── dashboard/          # Next.js frontend application
│   ├── src/app        # Next 13 app directory
│   │   ├── dashboard  # Dashboard page & subcomponents
│   │   ├── api        # (optional) serverless API routes
│   │   └── page.tsx   # Root landing page
│   ├── components/ui # Shared UI primitives (Card, Table, Button, etc.)
│   └── lib           # supabaseClient & utility functions
│
└── server/            # Node.js backend & webhook handler
    ├── config/       # Global configuration (API keys, ports)
    ├── controllers/  # Orchestrate requests & responses
    ├── routes/       # Express-style route definitions
    ├── services/     # Business logic (fmCSA, loadSearch, callStates)
    └── utils/        # Helper modules (supabaseClient, index.js)
```

---

## Prerequisites

* Node.js v18+ and npm (or Yarn)
* Access to a Supabase project (for the dashboard)
* FMCSA API Key (for MC number verification)

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

* Available at: `https://inbound-carrier-sales.vercel.app/`

### 2. Server (Node.js / Express)

```bash
cd server
npm run dev   # or: npm start
```

* Listens on: `http://localhost:4000/webhook`
* Exposes REST endpoints for `mc-number`, `load-details`, `final-offer`, `call-outcome`, and `carrier-sentiment`.

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

## Folder Structure

```text
inbound-carrier-sales/
├── dashboard/      # Next.js front end
│   ├── src/app/dashboard/components  # Dashboard UI components
│   ├── src/app/dashboard/styles      # CSS Modules / Tailwind styles
│   └── page.tsx                      # Routing entry point
├── server/         # Node.js back end
│   ├── controllers/  # Request handlers
│   ├── routes/       # Route declarations
│   ├── services/     # Core business logic
│   ├── utils/        # Low-level utilities
│   └── config.js     # Environment & ports
└── README.md       # This file
```


