# GearUp 🏋️

**"Rent Sports & Outdoor Gear Instantly"**

---

## 📡 API Endpoints

**Base URL:** `/api`

---

### 🔑 Authentication

| Method | Endpoint             | Access  | Description                           |
| ------ | -------------------- | ------- | ------------------------------------- |
| POST   | `/api/auth/register` | Public  | Register new user (customer/provider) |
| POST   | `/api/auth/login`    | Public  | Login user, return JWT tokens         |
| GET    | `/api/auth/me`       | Auth    | Get current authenticated user        |

---

### 🏷️ Categories

| Method | Endpoint              | Access | Description             |
| ------ | --------------------- | ------ | ----------------------- |
| GET    | `/api/categories`     | Public | Get all gear categories |
| POST   | `/api/categories`     | Admin  | Create a new category   |
| GET    | `/api/categories/:id` | Public | Get single category     |
| PUT    | `/api/categories/:id` | Admin  | Update a category       |
| DELETE | `/api/categories/:id` | Admin  | Delete a category       |

---

### 🏋️ Gear (Public)

| Method | Endpoint        | Access | Description                                           |
| ------ | --------------- | ------ | ----------------------------------------------------- |
| GET    | `/api/gear`     | Public | Get all gear (filter: category, price, brand, search) |
| GET    | `/api/gear/:id` | Public | Get single gear details with specifications           |

---

### 🏪 Provider — Gear Management

| Method | Endpoint                 | Access   | Description                |
| ------ | ------------------------ | -------- | -------------------------- |
| POST   | `/api/provider/gear`     | Provider | Add new gear to inventory  |
| GET    | `/api/provider/gear`     | Provider | Get provider's own gear    |
| PUT    | `/api/provider/gear/:id` | Provider | Update gear listing        |
| DELETE | `/api/provider/gear/:id` | Provider | Remove gear from inventory |

---

### 🏪 Provider — Order Management

| Method | Endpoint                   | Access   | Description                                        |
| ------ | -------------------------- | -------- | -------------------------------------------------- |
| GET    | `/api/provider/orders`     | Provider | Get provider's incoming rental orders              |
| GET    | `/api/provider/orders/:id` | Provider | Get single order details                           |
| PATCH  | `/api/provider/orders/:id` | Provider | Update order status (confirm, picked_up, returned) |

---

### 📦 Rental Orders

| Method | Endpoint           | Access   | Description              |
| ------ | ------------------ | -------- | ------------------------ |
| POST   | `/api/rentals`     | Customer | Create new rental order  |
| GET    | `/api/rentals`     | Customer | Get user's rental orders |
| GET    | `/api/rentals/:id` | Customer | Get rental order details |
| PATCH  | `/api/rentals/:id` | Customer | Cancel rental order      |

---

### 💳 Payments (Stripe)

| Method | Endpoint                | Access         | Description                                     |
| ------ | ----------------------- | -------------- | ----------------------------------------------- |
| POST   | `/api/payments/create`  | Customer       | Create Stripe Checkout Session for a rental order |
| POST   | `/api/payments/webhook` | Stripe Webhook | Verify Stripe webhook and mark paid orders        |
| GET    | `/api/payments`         | Customer       | Get user's payment history                      |
| GET    | `/api/payments/:id`     | Customer       | Get single payment details                      |

---

### ⭐ Reviews

| Method | Endpoint           | Access   | Description                            |
| ------ | ------------------ | -------- | -------------------------------------- |
| POST   | `/api/reviews`     | Customer | Create review (after gear is returned) |
| GET    | `/api/reviews`     | Customer | Get customer's reviews                     |

---

### 🛡️ Admin

| Method | Endpoint               | Access | Description                |
| ------ | ---------------------- | ------ | -------------------------- |
| GET    | `/api/admin/users`     | Admin  | Get all users              |
| PATCH  | `/api/admin/users/:id` | Admin  | Suspend or activate a user |
| GET    | `/api/admin/gear`      | Admin  | Get all gear listings      |
| GET    | `/api/admin/rentals`   | Admin  | Get all rental orders      |
