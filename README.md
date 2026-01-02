🧥 memi.az – Recommerce Platform Backend

📌 Project Overview

memi.az is a recommerce platform focused initially on second-hand clothes, shoes, bags, and accessories.
The platform enables users to buy and sell fashion items, communicate securely, and build trust through structured listings and interactions.

This repository contains the backend API, built with NestJS, designed to be:
• Modular
• Scalable
• AI-friendly for autonomous coding agents
• Production-ready with security best practices

The first goal is to launch a minimal but real MVP to validate user interest before expanding.

⸻

🎯 MVP BUSINESS GOALS 1. Allow users to list second-hand fashion items 2. Allow buyers to discover, filter, and contact sellers 3. Provide safe communication and basic trust controls 4. Keep the product simple, fast, and low-friction 5. Collect real usage data for future AI-driven features

⸻

🧱 TECH STACK

Layer Technology
Backend Framework NestJS
Language TypeScript
Database PostgreSQL
ORM Prisma
Auth JWT (Access + Refresh)
Realtime WebSockets
File Storage S3-compatible or Cloudinary
Validation class-validator
API Docs Swagger
Deployment Docker-ready

⸻

🧩 ARCHITECTURE PRINCIPLES
• Feature-based modules (not technical layers)
• Thin controllers, fat services
• DTO-driven validation
• Global exception handling
• Role-based access control
• Designed for AI agents to extend safely

⸻

📂 MODULE OVERVIEW (REQUIRED)

1️⃣ Auth Module

Handles authentication and authorization.

Responsibilities
• Register
• Login
• Refresh token rotation
• Logout
• Password reset
• JWT guards

Constraints
• Stateless access tokens
• Refresh tokens stored securely
• Role support (USER, ADMIN)

⸻

2️⃣ User Module

Manages user accounts and profiles.

User Fields
• id
• email
• password (hashed)
• name
• avatar
• city
• phone (optional)
• role
• isBlocked
• createdAt

Endpoints
• Get profile
• Update profile
• Public seller profile
• Block/unblock users (admin)

⸻

3️⃣ Product (Listing) Module

Core domain of the platform.

Product Fields
• title
• description
• price
• condition (ENUM)
• categoryId
• subcategoryId
• size
• color
• brand
• material
• images
• location (city)
• status (ACTIVE, RESERVED, SOLD, DELETED)
• sellerId

Features
• Create / edit / delete listings
• Pagination & filtering
• Full-text search
• Status management
• Ownership validation

⸻

4️⃣ Category Module

Manages product taxonomy.

Structure
• Category
• Subcategory
• Slug-based
• Pre-seeded data

Admin-only mutations.

⸻

5️⃣ Upload Module

Handles image uploads.

Requirements
• Max 8 images per product
• Compression + resizing
• webp support
• Secure public URLs
• Validation (size, type)

⸻

6️⃣ Favorites Module

Wishlist functionality.

Features
• Add/remove favorite
• List user favorites
• Favorite count per product

⸻

7️⃣ Chat Module (WebSockets)

Buyer ↔ Seller communication.

Rules
• One chat per product per buyer
• Seller cannot message first
• Messages are immutable
• Users can block chats

⸻

8️⃣ Reservation Module

Soft transaction system.

States
• REQUESTED
• ACCEPTED
• REJECTED
• CANCELLED

No payments in MVP.

⸻

9️⃣ Report Module

Trust & safety.

Users can report
• Products
• Users
• Chats

Admin moderation required.

⸻

🔟 Notification Module

User engagement.

Events
• New message
• Reservation updates
• Product status changes

Delivery:
• In-app
• Email (SMTP)

⸻

🔐 Admin Module

Platform management.

Admin Features
• Manage users
• Remove products
• Review reports
• View basic analytics

⸻

🧠 FUTURE AI-READY FEATURES (NOT MVP)

These must be architecturally supported but not implemented yet:
• AI pricing suggestions
• AI category auto-tagging from images
• Fraud detection
• Recommendation engine
• Smart feed ranking
• Chat moderation AI

⸻

🗃️ DATABASE MODELS (EXPECTED)
• User
• Product
• ProductImage
• Category
• Subcategory
• Favorite
• Chat
• Message
• Reservation
• Report
• Notification
• AdminActionLog

All relations must be explicit and indexed.

⸻

🔐 SECURITY REQUIREMENTS
• Password hashing (bcrypt)
• Rate limiting (login, chat)
• Input validation everywhere
• File upload sanitization
• Ownership checks on all mutations
• Soft deletes where applicable

⸻

🌐 API CONVENTIONS
• RESTful endpoints
• /api/v1 prefix
• Consistent error response format
• Pagination via page & limit
• Filtering via query params

⸻

🧪 TESTING EXPECTATIONS
• Unit tests for services
• E2E tests for critical flows:
• Auth
• Product creation
• Chat creation
• Mock external services

⸻

🚀 DEPLOYMENT EXPECTATIONS
• .env based config
• Docker-ready
• Stateless API
• Compatible with cloud hosting

⸻

🤖 INSTRUCTIONS FOR AI CODING AGENTS

You must: 1. Follow NestJS best practices 2. Use Prisma for all DB access 3. Generate DTOs for every request 4. Use guards instead of inline checks 5. Keep modules independent 6. Avoid over-engineering 7. Implement MVP first, extensible later

DO NOT
• Hardcode data
• Skip validation
• Mix responsibilities
• Implement payments yet
• Add unnecessary abstractions

⸻

✅ DEFINITION OF MVP SUCCESS
• User can list an item
• Another user can find it
• They can chat
• Seller can mark item as reserved/sold
• Admin can moderate content
• System is stable and secure

⸻
