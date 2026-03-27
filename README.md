# 👁 OptiVision — Optical Shop Management SaaS

A complete, production-ready Optical Shop Management & Billing System.

---

## 🚀 Quick Start (Docker — Recommended)

```bash
# 1. Clone / extract the project
cd optivision

# 2. Start all services
docker compose up -d --build

# 3. Open the app
open http://localhost:5173
```

**Login Credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@optivision.in | Admin@123 |
| Staff | priya@optivision.in | Staff@123 |

---

## 🛠️ Manual Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials

npm install
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
# → API running at http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:5000/api

npm install
npm run dev
# → App running at http://localhost:5173
```

---

## 📦 Project Structure

```
optivision/
├── backend/
│   ├── src/
│   │   ├── index.js            # Express app entry
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT auth middleware
│   │   ├── routes/
│   │   │   ├── auth.js         # Login, users
│   │   │   ├── customers.js    # Customer CRUD
│   │   │   ├── prescriptions.js# Rx management
│   │   │   ├── frames.js       # Frame inventory
│   │   │   ├── lenses.js       # Lens catalog
│   │   │   ├── orders.js       # Order lifecycle
│   │   │   ├── inventory.js    # Stock management
│   │   │   ├── reports.js      # Analytics
│   │   │   ├── dashboard.js    # KPI dashboard
│   │   │   ├── purchases.js    # Purchase orders
│   │   │   ├── suppliers.js    # Suppliers
│   │   │   └── stores.js       # Store settings
│   │   └── utils/
│   │       ├── prisma.js       # DB client
│   │       └── logger.js       # Winston logger
│   ├── prisma/
│   │   ├── schema.prisma       # DB schema
│   │   └── seed.js             # Sample data
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Routes
│   │   ├── components/
│   │   │   ├── layout/         # AppLayout, Sidebar
│   │   │   └── ui/             # Shared components
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx   # KPI + charts
│   │   │   ├── Customers.jsx   # Customer grid
│   │   │   ├── CustomerDetail.jsx # History + Rx
│   │   │   ├── Frames.jsx      # Gallery + filters
│   │   │   ├── Lenses.jsx      # Lens packages
│   │   │   ├── Orders.jsx      # Order list
│   │   │   ├── OrderCreate.jsx # 5-step wizard
│   │   │   ├── OrderDetail.jsx # Timeline + bill
│   │   │   ├── Billing.jsx     # POS counter
│   │   │   ├── Inventory.jsx   # Stock levels
│   │   │   ├── Reports.jsx     # Analytics
│   │   │   └── Settings.jsx    # Config + users
│   │   ├── stores/
│   │   │   └── authStore.js    # Zustand auth
│   │   └── services/
│   │       └── api.js          # Axios instance
│   └── Dockerfile
│
└── docker-compose.yml
```

---

## 🗄️ Database Schema

| Table | Description |
|-------|-------------|
| `stores` | Multi-store support |
| `users` | Staff with roles (SUPER_ADMIN / SHOP_ADMIN / STAFF) |
| `customers` | Customer profiles |
| `prescriptions` | Optical Rx with OD/OS fields |
| `frames` | Frame inventory with barcode |
| `lenses` | Lens catalog with coatings |
| `accessories` | Accessories catalog |
| `orders` | Full order lifecycle |
| `order_items` | Line items per order |
| `payments` | Payment records |
| `order_status_logs` | Status audit trail |
| `stock_movements` | Inventory audit log |
| `suppliers` | Supplier directory |
| `purchases` | Purchase orders |

---

## 🔌 API Reference

```
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/change-password
GET    /api/auth/users             (admin)
POST   /api/auth/users             (admin)

GET    /api/dashboard

GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id

GET    /api/prescriptions/customer/:customerId
POST   /api/prescriptions
GET    /api/prescriptions/:id

GET    /api/frames
POST   /api/frames
PUT    /api/frames/:id
DELETE /api/frames/:id
GET    /api/frames/barcode/:barcode
GET    /api/frames/low-stock

GET    /api/lenses
POST   /api/lenses
PUT    /api/lenses/:id

GET    /api/orders
POST   /api/orders
GET    /api/orders/:id
PATCH  /api/orders/:id/status
POST   /api/orders/:id/payment
DELETE /api/orders/:id             (admin)

GET    /api/inventory
GET    /api/inventory/movements
POST   /api/inventory/adjust

GET    /api/reports/sales
GET    /api/reports/frames
GET    /api/reports/customers
GET    /api/reports/profit

GET    /api/suppliers
POST   /api/suppliers
GET    /api/purchases
POST   /api/purchases

GET    /api/stores/current         (admin)
PUT    /api/stores/current         (admin)

POST   /api/upload
GET    /health
```

---

## ☁️ Deployment

### Railway.app (Easiest)
1. Push to GitHub
2. Connect Railway → New Project → Deploy from GitHub
3. Add PostgreSQL database from Railway dashboard
4. Set `DATABASE_URL` environment variable
5. Deploy!

### AWS / VPS
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone & start
git clone <repo>
cd optivision
docker compose up -d --build
```

---

## ✨ Features

- **Dashboard** — Today's revenue, pending orders, low stock alerts, charts
- **Customer CRM** — Search, history, prescriptions
- **Prescription Management** — OD/OS table with SPH/CYL/AXIS/ADD/PD
- **Frame Gallery** — Grid/list view, brand filters, barcode lookup
- **Lens Catalog** — Packages with coatings, indices
- **5-Step Order Wizard** — Customer → Frame → Rx → Lens → Checkout
- **GST Billing** — Automatic 18% GST, discounts, multi-payment
- **Order Tracking** — CREATED → LENS_ORDERED → GRINDING → FITTING → READY → DELIVERED
- **Inventory** — Stock levels, adjustment, movement log
- **Reports** — Sales trend, frame report, top customers, profit margin
- **Settings** — Store config, user management, password change
- **Role-Based Access** — SUPER_ADMIN / SHOP_ADMIN / STAFF

---

*Built with Node.js, Express, PostgreSQL, Prisma, React 18, Vite, Tailwind CSS*
