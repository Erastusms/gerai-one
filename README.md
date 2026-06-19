# GeraiOne Monorepo

Welcome to **GeraiOne**, a modern customer-facing e-commerce storefront and scalable backend ecosystem.

## Project Structure

This project is organized as a monorepo containing two independent services:

* **[frontend/](file:///c:/ProjectME/gerai-one/frontend)**: Next.js 16 storefront application built with React, Tailwind CSS, shadcn/ui, and Clerk Authentication.
* **[backend/](file:///c:/ProjectME/gerai-one/backend)**: Scalable Node.js, Fastify, Prisma ORM, and PostgreSQL API service providing identity webhooks, profile management, and structured logging.

## Prerequisites

* [Node.js](https://nodejs.org/) (v18 or higher)
* [Docker](https://www.docker.com/) and Docker Compose

## Quick Start

### 1. Launch the Database

Start the PostgreSQL container using Docker Compose:

```bash
docker compose up -d
```

### 2. Configure Backend Environment

Create a `.env` file in the `backend/` directory (see `backend/.env.example`).

### 3. Run Applications

From the root directory, you can run the applications using the monorepo workspace scripts:

#### Run Frontend
```bash
npm run dev:frontend
```

#### Run Backend
```bash
npm run dev:backend
```

#### Build All
```bash
npm run build:frontend
npm run build:backend
```
