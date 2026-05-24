# 🎓 EduFund AI — Education Loan Platform

> A production-ready fintech SaaS platform for intelligent education loan applications with AI-powered lead scoring and dead lead detection.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black) ![NestJS](https://img.shields.io/badge/NestJS-10-red) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue) ![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)

---

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Local Setup](#local-setup)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Screenshots](#screenshots)

---

## Overview

EduFund AI is a production-grade education loan platform that uses an intelligent scoring engine to evaluate student profiles and determine loan eligibility. It features a modern multi-step application form, real-time AI scoring, dead lead detection, and a comprehensive admin dashboard.

**Demo Credentials:**
- **Admin:** `admin@edufund.ai` / `Admin@1234`
- **Student:** `priya@example.com` / `Student@1234`

---

## Features

### 🏠 Landing Page
- Modern fintech design with blue/white gradient theme
- Hero section with live AI score preview
- How it works, features, eligibility, testimonials, FAQ sections
- Fully responsive, mobile-first layout
- Smooth Framer Motion animations

### 🔐 Authentication
- JWT-based authentication with 7-day token expiry
- bcrypt password hashing (12 salt rounds)
- Strong password validation (uppercase + lowercase + number + special char)
- Indian phone number validation
- Disposable email detection
- Duplicate account prevention

### 📝 Multi-Step Application Form (4 Steps)
1. **Personal Info** — Name, DOB (age 18+ check), gender, contact, address
2. **Academic Details** — University (auto tier detection), course, CGPA, admission status
3. **Financial Details** — Family income, existing loans, co-applicant, PAN + Aadhaar validation
4. **Loan Requirements** — Amount, tuition, living expenses, scholarship

Features:
- Auto-save on step navigation
- Resume draft application
- Real-time eligibility tips (Framer Motion transitions)
- Loan summary with loan-to-income ratio warning
- Dynamic suggestions ("Add co-applicant to improve score by +10")

### 🤖 AI Lead Scoring Engine
Evaluates 8+ factors with explainable scoring:

| Factor | Points |
|--------|--------|
| CGPA > 85% | +20 |
| CGPA 70–85% | +10 |
| CGPA < 60% | -10 |
| Tier-1 University | +20 |
| Tier-2 University | +10 |
| Family Income > ₹12L | +20 |
| Family Income ₹6L–₹12L | +10 |
| Family Income < ₹3L | -10 |
| STEM/MBA Course | +10 |
| Co-applicant Available | +10 |
| 3+ Existing Loans | -15 |
| Scholarship > 30% | +10 |
| Confirmed Admission | +5 |

**Lead Categories:**
- 🟢 High Quality: Score ≥ 75
- 🟡 Medium Quality: Score 45–74
- 🔴 Low Quality: Score < 45

### ⚠️ Dead Lead Detection
Automatically flags invalid applications:
- Disposable/fake email domains (mailinator, guerrillamail, etc.)
- Sequential/pattern phone numbers (1234567890, 9999999999)
- Keyboard mash in name/university fields
- Fake test PAN numbers
- Unrealistic income declarations
- Loan-to-income ratio > 50x
- Loan amount >> stated expenses

### 📊 Student Dashboard
- Application status tracking with visual progress
- AI Score ring visualization
- Score breakdown insights (factor-by-factor explanation)
- Rejection reasons for dead leads
- Resume draft applications

### 🛡️ Admin Dashboard
- All applications with search + filter (status, lead category)
- One-click Approve / Reject actions
- Analytics: pie chart (lead distribution), bar chart (status breakdown)
- User management table
- Key metrics: total apps, high quality leads, dead leads, approval rate, avg score

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| Next.js 14 (App Router) | React framework with SSR |
| TypeScript | Type safety |
| TailwindCSS | Utility-first styling |
| Framer Motion | Animations |
| Zustand | State management |
| Axios | HTTP client |
| Recharts | Charts |
| Sonner | Toast notifications |

### Backend
| Technology | Purpose |
|-----------|---------|
| NestJS 10 | Node.js framework |
| TypeScript | Type safety |
| Prisma ORM | Database access |
| PostgreSQL (Neon) | Database |
| JWT + Passport | Authentication |
| bcrypt | Password hashing |
| Helmet | Security headers |
| NestJS Throttler | Rate limiting |
| class-validator | DTO validation |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Next.js)                        │
│  Landing → Auth → Multi-Step Form → Dashboard → Admin Panel     │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS (JWT Bearer Token)
┌──────────────────────────▼──────────────────────────────────────┐
│                      BACKEND (NestJS)                           │
│                                                                 │
│   ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────┐   │
│   │  /auth   │  │ /applications│  │ /scoring │  │  /admin  │   │
│   └──────────┘  └──────────────┘  └──────────┘  └──────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │   Scoring Engine    │   Dead Lead Detector              │   │
│   │   (8+ factors)      │   (email/phone/PAN/ratio)         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│   │ JWT Guard  │  │ Admin Guard  │  │ Rate Limiter + Helmet  │  │
│   └────────────┘  └──────────────┘  └────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Prisma ORM
┌──────────────────────────▼──────────────────────────────────────┐
│                 PostgreSQL (Neon)                                │
│  users | loan_applications | personal_details | academic_details│
│  financial_details | loan_details | scoring_logs | dead_lead_logs│
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  phone        String   @unique
  passwordHash String
  role         Role     @default(STUDENT)
  applications LoanApplication[]
}

model LoanApplication {
  id           String            @id @default(cuid())
  userId       String
  status       ApplicationStatus @default(DRAFT)
  leadScore    Int?
  leadCategory LeadCategory      @default(UNSCORED)
  riskLevel    RiskLevel?
  isEligible   Boolean?
  // ... relations to all detail tables
}

// + PersonalDetails, AcademicDetails, FinancialDetails,
//   LoanDetails, ScoringLog, DeadLeadLog
```

---

## API Documentation

### Auth
```
POST /api/v1/auth/signup      Create account
POST /api/v1/auth/login       Login (returns JWT)
GET  /api/v1/auth/me          Get current user [JWT]
```

### Applications
```
POST   /api/v1/applications              Create draft [JWT]
GET    /api/v1/applications              Get user's apps [JWT]
GET    /api/v1/applications/:id          Get app by ID [JWT]
PATCH  /api/v1/applications/:id/personal Save personal details [JWT]
PATCH  /api/v1/applications/:id/academic Save academic details [JWT]
PATCH  /api/v1/applications/:id/financial Save financial details [JWT]
PATCH  /api/v1/applications/:id/loan     Save loan details [JWT]
POST   /api/v1/applications/:id/submit   Submit + score [JWT]
PATCH  /api/v1/applications/:id/status   Update status [Admin]
```

### Scoring
```
POST /api/v1/scoring/evaluate/:id   Re-evaluate application [Admin]
```

### Admin
```
GET /api/v1/admin/applications     List all apps + filters [Admin]
GET /api/v1/admin/analytics        Platform analytics [Admin]
GET /api/v1/admin/users            All users [Admin]
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL (or Neon account)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/your-username/edufund-ai.git
cd edufund-ai
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed with sample data (creates admin + student)
npm run prisma:seed

# Start development server
npm run start:dev
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your backend URL

# Start development server
npm run dev
```

Backend runs at: `http://localhost:4000`  
Frontend runs at: `http://localhost:3000`

---

## Deployment

### Backend → Railway or Render

1. Push code to GitHub
2. Create new project on [Railway](https://railway.app) or [Render](https://render.com)
3. Connect your repository
4. Set environment variables (see below)
5. Railway will auto-detect Node.js and run `npm start:prod`
6. The `Procfile` handles: `prisma migrate` → `start:prod`

**Build Command:** `npm install && npm run build && npm run prisma:generate && npm run prisma:migrate`  
**Start Command:** `npm run start:prod`

### Frontend → Vercel

1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set `NEXT_PUBLIC_API_URL` to your Railway/Render backend URL
4. Deploy (auto-detects Next.js)

### Database → Neon PostgreSQL

1. Create account at [neon.tech](https://neon.tech)
2. Create new project → copy connection string
3. Set as `DATABASE_URL` in backend `.env`

---

## Environment Variables

### Backend `.env`
```env
# Neon PostgreSQL connection string
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/edufund?sslmode=require"

# JWT secret (min 32 chars, use random string)
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"

# Server port
PORT=4000

# Node environment
NODE_ENV=production

# Frontend URL for CORS
FRONTEND_URL="https://your-app.vercel.app"
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
```

---

## Future Improvements

- [ ] OTP verification via SMS (Twilio/MSG91)
- [ ] Email notifications (SendGrid/Resend)
- [ ] Document upload (Aadhaar, PAN, admission letter) via S3
- [ ] Credit score simulation
- [ ] AI-generated risk summary (using Anthropic/OpenAI)
- [ ] Chatbot assistant for eligibility queries
- [ ] Audit logs for admin actions
- [ ] Loan EMI calculator widget
- [ ] Export applications to CSV/Excel
- [ ] Push notifications
- [ ] Mobile app (React Native)

---

## Project Structure

```
edufund-ai/
├── frontend/                   # Next.js 14 App
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── auth/           # Login & Signup
│   │   │   ├── dashboard/      # Student dashboard
│   │   │   ├── apply/          # Multi-step form
│   │   │   └── admin/          # Admin panel
│   │   ├── components/
│   │   │   └── shared/         # AuthGuard, etc.
│   │   ├── services/api.ts     # Axios API layer
│   │   ├── store/auth.store.ts # Zustand auth state
│   │   ├── types/index.ts      # TypeScript types
│   │   └── lib/utils.ts        # Utility functions
│   ├── package.json
│   └── vercel.json
│
└── backend/                    # NestJS API
    ├── src/
    │   ├── main.ts             # Entry point
    │   ├── app.module.ts       # Root module
    │   ├── auth/               # JWT auth
    │   ├── applications/       # Loan applications
    │   ├── scoring/            # AI scoring engine + dead lead detector
    │   ├── admin/              # Admin APIs
    │   ├── prisma/             # Prisma service
    │   └── common/             # Guards, decorators
    ├── prisma/
    │   ├── schema.prisma       # Database schema
    │   └── seed.ts             # Sample data
    ├── Procfile                # Deployment
    └── package.json
```

---

## License

MIT © 2025 EduFund AI
