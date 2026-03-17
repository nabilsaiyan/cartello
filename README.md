# Cartello — Premium Menswear E-Commerce

A full-stack menswear boutique built as a portfolio project to demonstrate production-grade Next.js architecture. Every part of the stack is real: live Stripe payments, PostgreSQL persistence, OAuth authentication, transactional email, image hosting on Cloudinary, and a fully operational admin dashboard.

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_7-2D3748?style=flat-square&logo=prisma)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=flat-square&logo=stripe&logoColor=white)

---

## Features

**Storefront**
- Responsive product listing with sidebar filters (category, price range, size, color) and multi-criteria sort
- Product detail page with image gallery, color/size variant selector, and customer reviews
- Persistent shopping cart and wishlist powered by Zustand + localStorage — survives page reloads without flicker
- Live search modal with instant results as you type
- Category landing pages and full-text search results

**Checkout & Payments**
- 3-step checkout: contact & shipping → shipping method → Stripe payment
- Stripe PaymentElement with card, Apple Pay, and Google Pay support
- Standard (5–7 days) and Express (1–2 days) shipping rates with automatic free shipping above €150
- Order confirmation email sent via Resend immediately after payment succeeds

**Authentication**
- Email/password sign-up with bcrypt password hashing
- One-click OAuth via GitHub and Google
- Protected `/account` and `/admin` routes with automatic redirect

**Account Area**
- Order history with per-order line items, status badges, and totals
- Profile editing — display name and password change
- Wishlist management — add, remove, and browse saved items

**Admin Dashboard**
- Revenue and orders-over-time charts powered by Recharts
- Full product CRUD with Cloudinary image upload and variant management
- Orders management — filter by status, update fulfillment state
- Customers directory and category management

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Database | Neon PostgreSQL (serverless) |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| Auth | NextAuth v5 — credentials + GitHub + Google OAuth |
| Payments | Stripe — PaymentIntent API + PaymentElement |
| Email | Resend |
| Image hosting | Cloudinary |
| State | Zustand with localStorage persistence |
| Data fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Notifications | Sonner toast |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── (shop)/           # Public storefront — homepage, products, cart, checkout
│   ├── account/          # Protected customer area — orders, profile, wishlist
│   ├── admin/            # Protected admin dashboard
│   ├── api/              # REST API routes — products, cart, checkout, orders, admin
│   └── auth/             # Sign-in and sign-up pages
├── components/
│   ├── layout/           # Navbar, Footer, CartDrawer, SearchModal
│   ├── product/          # ProductCard, ProductGallery, VariantSelector, Filters
│   ├── admin/            # Admin-specific forms, charts, and action components
│   └── ui/               # Badge, Skeleton, StarRating
├── lib/                  # Prisma client, auth config, Stripe, email, utils
├── store/                # Zustand cart and wishlist stores
└── types/                # Shared TypeScript interfaces
prisma/
├── schema.prisma         # Full data model — User, Product, Variant, Order, Review…
└── seed.ts               # 29 menswear products, 400+ variants across 4 categories
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database
- A [Stripe](https://stripe.com) account (test mode keys)
- A [Resend](https://resend.com) account
- A [Cloudinary](https://cloudinary.com) account
- GitHub and/or Google OAuth app credentials

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/cartello.git
cd cartello
npm install
```

### Environment Variables

Create a `.env` file at the root:

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="your-secret"

# OAuth
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Resend
RESEND_API_KEY="re_..."
EMAIL_FROM="Cartello <onboarding@resend.dev>"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Database Setup

```bash
# Push the schema to your Neon database
npx prisma db push

# Seed with 29 products and variants
npx prisma db seed
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Key Implementation Details

**Zustand hydration guard** — Zustand's `persist` middleware rehydrates from localStorage asynchronously after the first client render. Cart totals, wishlist icons, and nav badges all gate on a `_hasHydrated` flag to prevent a server/client mismatch and avoid the flash of incorrect state.

**Multi-step checkout without form value loss** — Each checkout step is a separate React component with its own `useForm` instance. Validated data is lifted to the parent in `useState` so values survive step transitions. Conditional rendering (`{step === N && <Step />}`) unmounts fields between steps, making a single shared form unworkable.

**Client-side payment confirmation** — Rather than relying on a Stripe webhook (which requires a public endpoint and a running tunnel in development), the client calls `POST /api/orders/:id/confirm` after `stripe.confirmPayment()` resolves. This endpoint verifies the PaymentIntent status directly with the Stripe API before marking the order as `PROCESSING` and sending the confirmation email. The endpoint is idempotent — repeat calls for already-confirmed orders are a no-op.

---

## License

MIT
