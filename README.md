# Point of Sale (POS) Fullstack System

Modern, scalable, containerized Point of Sale (POS) application built with **NestJS**, **Vue 3**, and **Docker Compose**.

---

## 🏗️ Architecture & Tech Stack

- **Backend**: [NestJS 10](https://nestjs.com/) (TypeScript, Express, Swagger OpenAPI, Validation Pipes, ConfigModule)
- **Frontend**: [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/) (TypeScript, Pinia Store, Vue Router 4, Lucide Icons)
- **Database**: [PostgreSQL 16](https://www.postgresql.org/)
- **Orchestration**: [Docker Compose](https://docs.docker.com/compose/) with multi-stage builds and development hot-reloading

---

## 📁 Project Structure

```
system-pos/
├── backend/                   # NestJS Backend API
│   ├── src/
│   │   ├── main.ts            # Application bootstrap & Swagger setup
│   │   ├── app.module.ts      # Root module
│   │   ├── app.controller.ts  # Health check endpoint
│   │   ├── app.service.ts
│   │   └── modules/pos/       # POS business logic, products & orders
│   ├── Dockerfile             # Multi-stage Dockerfile (dev / prod)
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/                  # Vue 3 Single Page Application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── views/             # POS Terminal, Dashboard, Products
│   │   ├── router/            # Vue Router definitions
│   │   ├── stores/            # Pinia POS state management
│   │   ├── services/          # Axios API communication
│   │   ├── App.vue
│   │   └── main.ts
│   ├── Dockerfile             # Multi-stage Dockerfile (dev / prod with NGINX)
│   ├── nginx.conf             # Production web server configuration
│   ├── vite.config.ts
│   └── package.json
│
├── docker-compose.yml          # Container configuration for DB, backend & frontend
├── .env.example                # Environment variables template
├── .env                        # Active environment variables
└── README.md
```

---

## 🚀 Getting Started with Docker (Recommended)

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 2. Launch the entire application
From the project root, run:

```bash
docker compose up --build
```

To run in the background (detached mode):
```bash
docker compose up -d --build
```

### 3. Access Services (Development)
- **Frontend UI (POS Terminal)**: [http://localhost:5175](http://localhost:5175)
- **Backend API**: [http://localhost:3005/api](http://localhost:3005/api)
- **Swagger API Docs**: [http://localhost:3005/api/docs](http://localhost:3005/api/docs)
- **PostgreSQL Database**: `localhost:5435`

### 4. Separate Production Environment (Nginx + Compiled Dist)
To run a separate, fully optimized Production environment (using multi-stage Nginx static web server & compiled NestJS app):

```bash
# Start Production stack
npm run prod:docker
# Or directly with Docker Compose:
docker compose -f docker-compose.prod.yml up -d --build
```

- **Production Frontend UI (Nginx Gzip)**: [http://localhost:8080](http://localhost:8080)
- **Production Backend API**: [http://localhost:3006/api](http://localhost:3006/api)
- **Production Swagger API Docs**: [http://localhost:3006/api/docs](http://localhost:3006/api/docs)
- **Production PostgreSQL Database**: `localhost:5436`

To stop the production environment:
```bash
npm run prod:down
# Or: docker compose -f docker-compose.prod.yml down
```

### 5. Stop Development Containers
```bash
npm run dev:down
# Or: docker compose -f docker-compose.yml down
```

---

## 💻 Running Locally Without Docker (Optional)

### Backend
```bash
cd backend
npm install
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Key Features

1. **POS Checkout Terminal**:
   - Product catalog with instant search & category filtering
   - Interactive order cart with quantity adjustments
   - Real-time calculations: Subtotal, customizable discounts, and configurable tax
   - Multi-payment support: Cash (with auto change calculation), Card, and QR Pay
   - Digital receipt modal on successful transaction
2. **Inventory Management**:
   - Stock indicators with low stock alerts
   - SKU tracking and price management
3. **Analytics Dashboard**:
   - Total revenue, orders completed, inventory metrics
   - Live transaction log & backend service health indicator
