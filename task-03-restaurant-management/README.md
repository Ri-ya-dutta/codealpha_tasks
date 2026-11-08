# Restaurant Management System

A backend REST API built with **Node.js, Express.js, and MongoDB** to manage restaurant operations, including menu items, orders, tables, reservations, and inventory.

## Features

- **Menu Management:** Create, view, update, and delete menu items.
- **Order Management:** Place orders, calculate order totals, and manage order processing and payment status.
- **Table Management:** Create tables, view tables, and update table details and availability.
- **Reservation Management:** Reserve tables with guest-capacity validation and overlapping reservation checks.
- **Inventory Management:** Add and update stock, view inventory, and automatically deduct ingredient quantities when an order is confirmed.
- **Authentication and Authorization:** JWT-based authentication with admin-only access to protected operations.
- **Daily Sales Report:** Calculate daily revenue and paid-order count.
- **Stock Alerts:** Identify inventory items that have reached or fallen below their minimum stock levels.

## Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- dotenv
- cors

## Project Structure

```text
task-03-restaurant-management/
└── server/
    ├── src/
    │   ├── config/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── models/
    │   ├── routes/
    │   ├── scripts/
    │   ├── app.js
    │   └── server.js
    ├── .env.example
    ├── package.json
    └── package-lock.json
```

## Setup and Installation

### 1. Navigate to the server directory

```bash
cd server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `server` directory using `.env.example` as a reference.

Configure the following variables:

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5003) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key used for JWT authentication |
| `JWT_EXPIRES_IN` | JWT expiration duration |
| `ADMIN_NAME` | Initial administrator name |
| `ADMIN_EMAIL` | Initial administrator email |
| `ADMIN_PASSWORD` | Initial administrator password |

Use your own MongoDB connection string and strong secret/password values. Do not commit `.env` to Git.

### 4. Create the initial admin account

```bash
npm run seed:admin
```

### 5. Start the development server

```bash
npm run dev
```

For production:

```bash
npm start
```

The API runs at:

```text
http://localhost:5003
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/login` | Admin/staff login | Public |

### Menu

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/menu` | View menu items | Public |
| POST | `/api/menu` | Create a menu item | Admin |
| PUT | `/api/menu/:id` | Update a menu item | Admin |
| DELETE | `/api/menu/:id` | Delete a menu item | Admin |

### Tables

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/tables` | View restaurant tables | Public |
| POST | `/api/tables` | Create a table | Admin |
| PATCH | `/api/tables/:id` | Update table details/status | Admin |

### Reservations

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/reservations` | Reserve a table | Public |
| GET | `/api/reservations` | View reservations | Admin |
| PATCH | `/api/reservations/:id/cancel` | Cancel a reservation | Admin |

### Orders

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/orders` | Place an order | Public |
| GET | `/api/orders` | View all orders | Admin |
| PATCH | `/api/orders/:id/confirm` | Confirm order and deduct inventory | Admin |
| PATCH | `/api/orders/:id/status` | Update order processing/payment status | Admin |

### Inventory

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/inventory` | View inventory | Public |
| POST | `/api/inventory` | Add inventory stock | Admin |
| PATCH | `/api/inventory/:id` | Update inventory | Admin |
| GET | `/api/inventory/low-stock` | View low-stock items | Admin |

### Reports

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/reports/daily-sales` | View daily sales and paid-order count | Admin |
| GET | `/api/reports/stock-alerts` | View low-stock alerts | Admin |

## Key Business Logic

- Order totals are calculated using menu item prices and requested quantities.
- Orders are initially created with `pending` status and `unpaid` payment status.
- Confirming an order deducts the required ingredient quantities from inventory.
- Inventory deduction is protected against insufficient stock and repeated order confirmation.
- Reservations are validated against table capacity and existing overlapping confirmed reservations.
- Cancelled reservations do not block future reservations.
- Daily sales reports count orders marked as `paid`.
- Stock alerts identify items whose available quantity is less than or equal to their minimum stock level.

## Authentication

Protected endpoints require a valid JWT access token in the request header:

```text
Authorization: Bearer <your_jwt_token>
```

Administrative endpoints require an authenticated user with the admin role.

## Health Check

```http
GET /health
```

## Database

MongoDB stores the following collections:

- Users
- Menu items
- Restaurant tables
- Reservations
- Orders
- Inventory

Developed as part of the CodeAlpha Backend Development Internship.
