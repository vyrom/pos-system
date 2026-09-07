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

### 3. Access Services
- **Frontend UI (POS Terminal)**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000/api](http://localhost:3000/api)
- **Swagger API Docs**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- **PostgreSQL Database**: `localhost:5432` (User: `pos_user`, Database: `pos_db`)

### 4. Stop containers
```bash
docker compose down
```
To stop and remove database volumes:
```bash
docker compose down -v
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
