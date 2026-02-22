<div align="center">

# 🚗 Jet & Keys ✈️

### **Premium Car Rental & Private Jet Services — Nigeria**

A full-stack, production-ready platform for booking luxury cars and private jets, built with Next.js, Supabase, and Tailwind CSS.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Jet & Keys** is a Nigerian-focused luxury vehicle and private jet rental platform. The project is structured as a **monorepo** containing two independent Next.js applications:

| App | Description | Port | Framework |
|-----|-------------|------|-----------|
| **car-rental-nigeria** | Customer-facing website | 3000 | Next.js 15 + React 19 |
| **admin** | Admin dashboard and CMS | 3001 | Next.js 13 + React 18 |

Both applications share a **Supabase (PostgreSQL)** backend with Row Level Security (RLS), image storage, and real-time capabilities.

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────┐
│                     Jet & Keys                       │
│                     (Monorepo)                       │
├──────────────────────┬───────────────────────────────┤
│   Customer Website   │       Admin Dashboard         │
│  (car-rental-nigeria)│          (admin)               │
│  Next.js 15 • :3000  │    Next.js 13 • :3001         │
│  React 19            │    React 18                   │
│  TailwindCSS 4       │    TailwindCSS 3              │
│  Shadcn UI + Radix   │    Shadcn UI                  │
│  Framer Motion       │    Lucide Icons               │
│  React Hook Form     │                               │
│  TanStack Query      │                               │
├──────────────────────┴───────────────────────────────┤
│                   Supabase Backend                   │
│    PostgreSQL • Auth • Storage • Row Level Security  │
└──────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🌐 Customer Website (car-rental-nigeria)

| Feature | Description |
|---------|-------------|
| **Car Browsing** | Search, filter, and view detailed car listings with images, specs, and pricing |
| **Jet Browsing** | Browse private jet options with capacity, range, and speed info |
| **Smart Checkout** | Multi-step checkout with date/time picker, location selection, and payment |
| **Booking Management** | Customers can view, track, and cancel their bookings |
| **Car Feature Display** | Organized feature cards for comfort, technology, and safety features |
| **Location Picker** | Interactive pickup and drop-off location selection |
| **Price Filtering** | Range slider for budget-based filtering |
| **Responsive Design** | Fully optimized for desktop, tablet, and mobile |
| **SEO Optimized** | Proper meta tags, semantic HTML, structured data |
| **Animations** | Smooth page transitions and micro-animations via Framer Motion |
| **About Us** | Multi-section about page with company story and values |
| **Contact Form** | Direct contact form with company info |
| **FAQ Section** | Common questions and answers |
| **Legal Pages** | Privacy policy, terms of service, refund policy |

### 🛠 Admin Dashboard (admin)

| Feature | Description |
|---------|-------------|
| **Dashboard Analytics** | Real-time stats: total cars, jets, bookings, revenue, user activity |
| **Car Management** | Full CRUD for car inventory with image uploads, pricing tiers, and feature configuration |
| **Jet Management** | Full CRUD for jet fleet with specs (capacity, range, speed) |
| **Booking Management** | View, approve, reject, and complete bookings with status filters |
| **User Management** | Manage users, assign roles (admin/user), activate/deactivate |
| **Finance Dashboard** | Revenue tracking and payment status monitoring |
| **Location Management** | Manage pickup/drop-off locations |
| **Cancellation Handling** | Process cancellations and refunds |
| **Late Return Tracking** | Monitor and manage late returns with fees |
| **Checkout Configuration** | Configure VAT, service fees, insurance, delivery fees, payment methods |
| **Website Settings** | Dynamic website content management (site name, contact info, etc.) |

### 🔧 Car Feature System

The admin panel includes a powerful **feature configuration system** for vehicles:

- **Basic Information** — Seats, doors, mileage, fuel type, transmission, year, color
- **Comfort Features** — Air conditioning, heated/leather seats, power windows, cruise control, sunroof
- **Technology Features** — GPS, Bluetooth, USB, Apple CarPlay, Android Auto, wireless charging
- **Safety Features** — ABS, airbags, backup camera, parking sensors, lane assist, emergency braking

Features are selected via an interactive modal, configured with values, and displayed with icons on the customer website.

---

## 🛠 Tech Stack

### Customer Website

| Technology | Purpose |
|------------|---------|
| [Next.js 15](https://nextjs.org/) | React framework with Turbopack |
| [React 19](https://react.dev/) | UI library |
| [TypeScript 5](https://typescriptlang.org/) | Type safety |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling |
| [Shadcn UI](https://ui.shadcn.com/) + Radix | Accessible UI components |
| [Framer Motion](https://www.framer.com/motion/) | Animations and transitions |
| [TanStack React Query](https://tanstack.com/query) | Server state management |
| [React Hook Form](https://react-hook-form.com/) + Zod | Form handling and validation |
| [Supabase JS](https://supabase.com/docs/reference/javascript) | Database client |
| [Lucide React](https://lucide.dev/) | Icon library |
| [date-fns](https://date-fns.org/) | Date utilities |

### Admin Dashboard

| Technology | Purpose |
|------------|---------|
| [Next.js 13](https://nextjs.org/) | React framework |
| [React 18](https://react.dev/) | UI library |
| [TypeScript 5](https://typescriptlang.org/) | Type safety |
| [Tailwind CSS 3](https://tailwindcss.com/) | Utility-first styling |
| [Shadcn UI](https://ui.shadcn.com/) | UI components |
| [Supabase JS](https://supabase.com/docs/reference/javascript) | Database and auth client |
| [Lucide React](https://lucide.dev/) | Icon library |

---

## 📁 Project Structure

```
Jet-keys/
├── car-rental-nigeria/          # Customer-facing website
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── about/page.tsx        # About Us
│   │   │   ├── cars/page.tsx         # Car listings
│   │   │   ├── jets/page.tsx         # Jet listings
│   │   │   ├── checkout/page.tsx     # Booking checkout
│   │   │   ├── my-bookings/page.tsx  # User bookings
│   │   │   ├── contact/page.tsx      # Contact page
│   │   │   ├── privacy/page.tsx      # Privacy policy
│   │   │   ├── terms/page.tsx        # Terms of service
│   │   │   ├── refund/page.tsx       # Refund policy
│   │   │   └── globals.css           # Global styles
│   │   ├── components/
│   │   │   ├── ui/                   # Shadcn UI components
│   │   │   ├── navigation.tsx        # Site navigation
│   │   │   ├── footer-section.tsx    # Footer
│   │   │   ├── car-specifications.tsx
│   │   │   ├── car-features-display.tsx
│   │   │   ├── checkout-info-section.tsx
│   │   │   ├── checkout-payment-section.tsx
│   │   │   ├── location-picker.tsx
│   │   │   ├── date-picker-with-time.tsx
│   │   │   ├── price-range-slider.tsx
│   │   │   ├── faq-section.tsx
│   │   │   ├── review-section.tsx
│   │   │   └── ...more components
│   │   ├── lib/
│   │   │   ├── supabase.ts           # Supabase client config
│   │   │   └── utils.ts              # Utility functions
│   │   └── types/
│   │       └── database.ts           # TypeScript types
│   ├── assets/                       # Static assets and images
│   ├── designinspo/                  # Design reference images
│   ├── public/                       # Public assets
│   ├── scripts/                      # Utility scripts
│   ├── database-schema.sql           # Complete DB schema
│   ├── next.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── ...config files
│
├── admin/                            # Admin dashboard
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   ├── cars/page.tsx         # Car management
│   │   │   ├── jets/page.tsx         # Jet management
│   │   │   ├── bookings/page.tsx     # Booking management
│   │   │   ├── users/page.tsx        # User management
│   │   │   ├── finance/page.tsx      # Finance dashboard
│   │   │   ├── locations/page.tsx    # Location management
│   │   │   ├── cancellations/page.tsx
│   │   │   ├── late-returns/page.tsx
│   │   │   ├── checkout-config/page.tsx
│   │   │   ├── website-settings/page.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/                   # Shadcn UI components
│   │   │   ├── admin-layout.tsx      # Admin shell layout
│   │   │   ├── car-feature-selector.tsx
│   │   │   └── location-selector.tsx
│   │   └── lib/
│   │       ├── supabase.ts           # Supabase client
│   │       ├── admin-services.ts     # Business logic
│   │       ├── image-upload.ts       # Image upload helpers
│   │       └── utils.ts
│   ├── sql migration files/          # SQL migrations
│   ├── database-schema.sql
│   ├── next.config.js
│   ├── package.json
│   ├── tsconfig.json
│   └── ...config files
│
├── Visualchanges/                    # UI screenshots and references
├── FEATURE_SYSTEM_GUIDE.md           # Car feature system docs
├── QUICK_FEATURE_ACCESS.md           # Quick-start guide
├── package.json                      # Root dependencies
├── .gitignore
└── README.md
```

---

## 🗄 Database Schema

The platform uses **Supabase (PostgreSQL)** with the following tables:

### Core Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| cars | Car inventory | name, brand, model, year, pricing (daily/weekly/monthly), fuel type, transmission, features (JSONB), images (JSONB), location, status |
| jets | Jet inventory | name, manufacturer, model, capacity, range, max speed, pricing (hourly/daily), features, images |
| users | User accounts | email, name, phone, role (admin/user), is_active |
| bookings | Rental bookings | user_id, car_id/jet_id, booking_type, dates, locations, amount, status, payment_status, customer details |

### Configuration Tables

| Table | Description |
|-------|-------------|
| website_settings | Dynamic site content (key-value with type enforcement) |
| checkout_settings | VAT percentage, service/insurance/delivery fees, currency, payment methods |

### Security

- **Row Level Security (RLS)** enabled on all tables
- Public read access to cars and jets
- Admin full CRUD access
- Users can create and view their own bookings

### Indexes

Optimized indexes on frequently queried columns:

- **Cars:** brand, location, status, is_available
- **Jets:** manufacturer, location, status, is_available
- **Bookings:** user_id, car_id, jet_id, status, payment_status, pickup_date
- **Users:** email, role

> 💡 The full SQL schema is available in [car-rental-nigeria/database-schema.sql](car-rental-nigeria/database-schema.sql)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn**
- A **Supabase** account ([sign up free](https://supabase.com))

### 1. Clone the Repository

```bash
git clone https://github.com/iluyobrainy/Jet-keys.git
cd Jet-keys
```

### 2. Set Up the Database

1. Create a new project on [Supabase](https://supabase.com/dashboard)
2. Go to the **SQL Editor**
3. Run the contents of [car-rental-nigeria/database-schema.sql](car-rental-nigeria/database-schema.sql)
4. This creates all tables, indexes, RLS policies, triggers, and seed data

### 3. Install and Run the Customer Website

```bash
cd car-rental-nigeria
yarn install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Start the dev server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Install and Run the Admin Dashboard

```bash
cd admin
yarn install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Start the dev server:

```bash
yarn dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 🔐 Environment Variables

### Customer Website (car-rental-nigeria/.env.local)

| Variable | Description | Required |
|----------|-------------|----------|
| NEXT_PUBLIC_SUPABASE_URL | Your Supabase project URL | Yes |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Your Supabase anonymous API key | Yes |
| NEXT_PUBLIC_APP_URL | Application URL | Yes |

### Admin Dashboard (admin/.env.local)

| Variable | Description | Required |
|----------|-------------|----------|
| NEXT_PUBLIC_SUPABASE_URL | Your Supabase project URL | Yes |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Your Supabase anonymous API key | Yes |

---

## 🌍 Deployment

### Vercel (Recommended)

Deploy each app as a separate Vercel project:

**Customer Website:**

1. Import the repo on [Vercel](https://vercel.com)
2. Set **Root Directory** to `car-rental-nigeria`
3. Add the environment variables
4. Deploy

**Admin Dashboard:**

1. Create another Vercel project from the same repo
2. Set **Root Directory** to `admin`
3. Add the environment variables
4. Deploy

### Netlify

Both apps include `netlify.toml` configurations:

```bash
# Customer website
cd car-rental-nigeria && yarn build

# Admin dashboard
cd admin && yarn build
```

### Other Platforms

Compatible with any platform supporting Next.js:

- Railway
- DigitalOcean App Platform
- AWS Amplify
- Render

---

## 📸 Screenshots

Design references and visual change logs are available in the [Visualchanges/](Visualchanges/) directory.

---

## 🤝 Contributing

1. **Fork** this repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m "Add amazing feature"`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For support, reach out via:

- **Email:** info@jetandkeys.com
- **Issues:** [Open an issue](https://github.com/iluyobrainy/Jet-keys/issues)

---

<div align="center">

**Built with ❤️ for the Nigerian market**

**Jet & Keys** — Premium mobility, redefined.

</div>
