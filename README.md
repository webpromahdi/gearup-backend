# GearUp 🏋️

**"Rent Sports & Outdoor Gear Instantly"**

![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat&logo=Prisma&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=flat&logo=Stripe&logoColor=white)

A robust backend service for GearUp, a platform connecting outdoor enthusiasts to rent sports and outdoor gear. It provides secure authentication, comprehensive role-based access control, provider inventory management, rental order processing, and Stripe integration for payments.

---

## 🌟 Features

- **JWT Authentication**: Secure user login and registration with access and refresh tokens.
- **Role-Based Authorization**: Distinct access levels for Customers, Providers, and Admins.
- **Prisma ORM**: Type-safe database queries and migrations.
- **PostgreSQL**: Highly reliable relational database.
- **Stripe Payments**: Seamless checkout session creation and webhook processing.
- **Rental Management**: Complete order lifecycle (Placed, Confirmed, Paid, Picked Up, Returned, Cancelled).
- **Provider Dashboard APIs**: Manage gear inventory, track incoming rental orders, and update statuses.
- **Admin APIs**: Oversee users, gear listings, and system-wide rental activities.
- **Review System**: Customers can rate and review gear after returning.
- **Global Error Handling**: Standardized error responses across all endpoints.
- **Validation**: Strict request payload validation using middleware.
- **TypeScript**: Statically typed code for better developer experience and maintainability.

---

## 🛠️ Tech Stack

**Backend**: Node.js, Express, TypeScript  
**Database**: PostgreSQL  
**ORM**: Prisma  
**Authentication**: JWT, bcryptjs  
**Payment**: Stripe  
**Runtime**: Node.js (`tsx` for dev, `node` for prod)  

---

## 🏗️ System Architecture

![Architecture](./diagram.png)

---

## 📂 Project Structure

```text
src/
├── config/              # Environment configurations
├── lib/                 # Core libraries and adapters
├── middlewares/         # Global middlewares (Auth, Validation, Error Handling)
├── modules/             # Feature-based modular architecture
│   ├── admin/           # Admin operations
│   ├── auth/            # Authentication logic
│   ├── category/        # Gear categories
│   ├── gearItem/        # Gear management
│   ├── payment/         # Stripe integration & Webhooks
│   ├── rentalOrder/     # Rental processing
│   └── review/          # Reviews logic
├── routes/              # Centralized route definitions
├── utils/               # Helper utilities and custom error classes
├── app.ts               # Express app setup
└── server.ts            # Server entry point
```

---

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/webpromahdi/gearup-backend.git
cd gearup-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and configure the variables (see the Environment Variables section below).
```bash
cp .env.example .env
```

### 4. Generate Prisma Client
```bash
npx prisma generate
```

### 5. Run Database Migrations
```bash
npx prisma migrate dev
```

### 6. Run Development Server
```bash
npm run dev
```

### 7. Build for Production
```bash
npm run build
```

### 8. Run Production Server
```bash
npm start
```

---

## ⚙️ Environment Variables

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `DIRECT_URL` | Direct DB connection string for Prisma | `postgresql://user:pass@localhost:5432/db` |
| `PORT` | Application port | `5000` |
| `APP_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `BCRYPT_SALT_ROUNDS`| Salt rounds for password hashing | `10` |
| `JWT_ACCESS_SECRET` | Secret key for access tokens | `your_jwt_access_secret` |
| `JWT_REFRESH_SECRET`| Secret key for refresh tokens | `your_jwt_refresh_secret` |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry | `1d` |
| `JWT_REFRESH_EXPIRES_IN`| Refresh token expiry | `7d` |
| `STRIPE_PRODUCT_PRICE_ID` | Default Stripe product ID | `price_1xyz...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |
| `STRIPE_CURRENCY` | Currency for payments | `usd` |

---

## 📜 Available Scripts

- `npm run dev`: Starts the development server using `tsx`.
- `npm run build`: Generates the Prisma client and compiles TypeScript to JavaScript.
- `npm start`: Runs the compiled production build from `dist/src/server.js`.
- `npm run postinstall`: Automatically generates Prisma client after package installation.

---

## 📡 API Endpoints

**Base URL:** `/api`

---

### 🔑 Authentication

| Method | Endpoint             | Access | Description                           |
| ------ | -------------------- | ------ | ------------------------------------- |
| POST   | `/api/auth/register` | Public | Register new user (customer/provider) |
| POST   | `/api/auth/login`    | Public | Login user, return JWT tokens         |
| GET    | `/api/auth/me`       | Auth   | Get current authenticated user        |

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

| Method | Endpoint                | Access         | Description                                       |
| ------ | ----------------------- | -------------- | ------------------------------------------------- |
| POST   | `/api/payments/create`  | Customer       | Create Stripe Checkout Session for a rental order |
| POST   | `/api/payments/webhook` | Stripe Webhook | Verify Stripe webhook and mark paid orders        |
| GET    | `/api/payments`         | Customer       | Get user's payment history                        |
| GET    | `/api/payments/:id`     | Customer       | Get single payment details                        |

---

### ⭐ Reviews

| Method | Endpoint       | Access   | Description                            |
| ------ | -------------- | -------- | -------------------------------------- |
| POST   | `/api/reviews` | Customer | Create review (after gear is returned) |
| GET    | `/api/reviews` | Customer | Get customer's reviews                 |

---

### 🛡️ Admin

| Method | Endpoint               | Access | Description                |
| ------ | ---------------------- | ------ | -------------------------- |
| GET    | `/api/admin/users`     | Admin  | Get all users              |
| PATCH  | `/api/admin/users/:id` | Admin  | Suspend or activate a user |
| GET    | `/api/admin/gear`      | Admin  | Get all gear listings      |
| GET    | `/api/admin/rentals`   | Admin  | Get all rental orders      |

---

## 🚨 Error Response Format

The backend utilizes a global error handler to provide consistent and descriptive JSON error responses.

```json
{
  "success": false,
  "message": "Invalid request data",
  "errorDetails": {
    "name": "PrismaClientValidationError",
    "message": "Detailed original error message"
  }
}
```

*Note: Prisma-specific errors (e.g., Unique constraint failed) return appropriate HTTP status codes (like `400 Bad Request` or `404 Not Found`) and attach extra metadata.*

---

## 🔐 Authentication

The application uses **JWT (JSON Web Tokens)** for stateless authentication.
1. Users register or login using their credentials.
2. The server hashes passwords using `bcryptjs`.
3. Upon successful login, an Access Token and a Refresh Token are generated.
4. Protected routes require the Access Token to be passed in the `Authorization` header as a Bearer token.

---

## 🛡️ Authorization

Access is strictly governed using a Role-Based Access Control (RBAC) system:
- **CUSTOMER**: Can browse gear, place rental orders, leave reviews, and view their own history.
- **PROVIDER**: Can add, update, and delete their own gear listings, as well as manage incoming orders for their gear.
- **ADMIN**: Has complete oversight, capable of managing all users, viewing all gear, and auditing all rentals.

---

## 🗄️ Database

The database is built on **PostgreSQL** and managed via **Prisma ORM**. Key entities include:
- `User`: Manages authentication, roles, and profiles.
- `Profile`: Extended user details.
- `Category`: Categorization of gear items.
- `GearItem`: The core entity representing rentable equipment, tied to a Category and a Provider (User).
- `RentalOrder`: Tracks rental periods, amounts, and statuses, linking a Customer (User) to a GearItem.
- `Payment`: Financial transaction logs for rental orders.
- `Review`: Post-rental feedback on gear.

---

## 🚀 Deployment

The backend is configured as a standard Node.js application, making it easy to deploy on modern cloud platforms such as **Vercel, Render, Heroku, or AWS**. 
1. Ensure the PostgreSQL database is externally accessible.
2. Set all Environment Variables in the hosting dashboard.
3. The build process runs `npm run build` which safely executes `prisma generate && tsc`.
4. The start command is seamlessly handled via `npm start`.

---

## 🔒 Security

- **Password Hashing**: Done securely via `bcryptjs` with configurable salt rounds.
- **JWT Protection**: Tokens verify the integrity and identity of requests.
- **Protected Routes**: Middleware verifies tokens and blocks unauthenticated requests.
- **Role Middleware**: Ensures users can only access endpoints mapped to their privileges.
- **Prisma Safety**: Prevents SQL injection out of the box.

---

## 🔮 Future Improvements

- Add email notifications for order status changes.
- Implement real-time chat between Customer and Provider.
- Add geographic search for nearby gear rentals.

---

## 📄 License

ISC
