# Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- PostgreSQL (v14 or higher)

## Installation Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set your database URL and JWT secrets:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/memi_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
```

### 3. Set Up Database

Generate Prisma Client:

```bash
pnpm prisma:generate
```

Create and run migrations:

```bash
pnpm prisma:migrate
```

(Optional) Seed the database:

```bash
pnpm prisma:seed
```

### 4. Start Development Server

```bash
pnpm start:dev
```

The API will be available at:
- API: http://localhost:3000/api/v1
- Swagger Docs: http://localhost:3000/api/docs

## Project Structure

```
src/
├── common/              # Shared utilities, guards, filters, decorators
│   ├── decorators/      # Custom decorators (Public, Roles)
│   ├── filters/         # Exception filters
│   ├── guards/          # Auth and role guards
│   ├── services/        # Shared services (PrismaService)
│   └── types/           # Common types and enums
├── core/                # Core module (Config, global providers)
├── modules/             # Feature modules
│   ├── auth/            # Authentication module
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── strategies/
│   │   └── dtos/
│   └── users/           # User management module
│       ├── controllers/
│       ├── services/
│       └── dtos/
└── main.ts              # Application entry point
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token

### Users
- `GET /api/v1/users/profile` - Get current user profile (Protected)
- `PUT /api/v1/users/profile` - Update current user profile (Protected)
- `GET /api/v1/users/:id/public` - Get public user profile

## Testing

Run unit tests:
```bash
pnpm test
```

Run e2e tests:
```bash
pnpm test:e2e
```

## Next Steps

The following modules are ready to be implemented:
- Product (Listing) Module
- Category Module
- Upload Module
- Favorites Module
- Chat Module (WebSockets)
- Reservation Module
- Report Module
- Notification Module
- Admin Module

