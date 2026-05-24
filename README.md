# EduFund AI — Education Loan Platform

I built this as part of the internship selection task. The goal was to create an education loan application system with smart lead evaluation — but I wanted to go beyond a basic CRUD app and build something that actually feels like a real product.

**Live Demo:** https://edufund-ai-app.vercel.app  
**Backend API:** https://edufund-ai-production.up.railway.app/api/v1  
**GitHub:** https://github.com/Sid-parjane/edufund-ai

---

## What I Built

A full-stack fintech platform where students can apply for education loans, get instant AI-powered eligibility scoring, and track their application status. On the backend, every submission runs through a scoring engine and a dead lead detector before a human ever sees it.

---

## The Problem I Was Solving

Education loan applications are messy. Students don't know if they qualify until weeks later. Lenders waste time on fake or low-quality leads. I wanted to flip that — give students instant feedback on their profile, and give lenders pre-scored, pre-filtered leads.

---

## How It Works

**For Students:**
1. Sign up and start a 4-step application
2. Fill in personal, academic, financial, and loan details
3. Submit — the AI scores your profile instantly (0–100)
4. See your score, risk level, and a detailed breakdown on your dashboard

**For Admins:**
1. Log in to the admin panel
2. See all applications with filters by status and lead quality
3. One-click approve or reject
4. Analytics dashboard with charts showing lead distribution and trends

---

## The Scoring Engine

This was the most interesting part to build. Rather than a black box, every score is explainable. Here's the logic I designed:

| What I Check | Impact |
|---|---|
| CGPA above 85% | +20 points |
| CGPA between 70–85% | +10 points |
| CGPA below 60% | −10 points |
| Tier-1 university (IIT, IIM, NIT, etc.) | +20 points |
| Tier-2 university | +10 points |
| Family income above ₹12L | +20 points |
| Family income ₹6L–₹12L | +10 points |
| Family income below ₹3L | −10 points |
| STEM or MBA course | +10 points |
| Co-applicant available | +10 points |
| 3+ existing loans | −15 points |
| Scholarship above 30% | +10 points |
| Confirmed admission | +5 points |

Score ≥ 75 → High Quality  
Score 45–74 → Medium Quality  
Score < 45 → Low Quality

Every application also gets a Groq Llama 3.1 AI-generated risk summary — a 3–4 sentence analyst-style assessment that explains the strengths and concerns in plain English.

---

## Dead Lead Detection

I built a separate detector that runs before scoring. It automatically flags and rejects applications with:

- Disposable email domains (mailinator, guerrillamail, tempmail, etc.)
- Fake phone patterns (1234567890, 9999999999, etc.)
- Keyboard mash in name or university fields (qwerty, asdfgh, etc.)
- Test PAN numbers
- Unrealistic income (declaring ₹100 Crore+)
- Loan amount that's 50x the family income
- Loan amount way higher than stated tuition + expenses

If flagged, the application is marked as Dead Lead with the specific reason stored.

---

## Tech Stack

**Frontend:** Next.js 14, TypeScript, TailwindCSS, Framer Motion, Zustand, Recharts  
**Backend:** NestJS, TypeScript, Prisma ORM  
**Database:** PostgreSQL on Neon  
**AI:** Groq API (Llama 3.1)  
**Auth:** JWT + bcrypt  
**Deployed:** Vercel (frontend) + Railway (backend) + Neon (database)

---

## Architecture

```
Next.js Frontend (Vercel)
        │
        │ HTTPS + JWT
        ▼
NestJS Backend (Railway)
  ├── /auth         → signup, login, JWT
  ├── /applications → 4-step form CRUD + submit
  ├── /scoring      → lead scoring + Groq AI
  └── /admin        → analytics + management
        │
        │ Prisma ORM
        ▼
PostgreSQL on Neon
  users, loan_applications, personal_details,
  academic_details, financial_details, loan_details,
  scoring_logs, dead_lead_logs
```

---

## Database Design

I designed 8 tables with proper relations:

- `users` — auth and role management
- `loan_applications` — master record with status, score, category
- `personal_details` — step 1 form data
- `academic_details` — step 2, includes auto-detected university tier
- `financial_details` — step 3, income and loan data
- `loan_details` — step 4, amounts and purpose
- `scoring_logs` — every scoring factor stored with explanation
- `dead_lead_logs` — reason stored for every flagged application

---

## API Design

```
POST   /api/v1/auth/signup
POST   /api/v1/auth/login
GET    /api/v1/auth/me

POST   /api/v1/applications
GET    /api/v1/applications
GET    /api/v1/applications/:id
PATCH  /api/v1/applications/:id/personal
PATCH  /api/v1/applications/:id/academic
PATCH  /api/v1/applications/:id/financial
PATCH  /api/v1/applications/:id/loan
POST   /api/v1/applications/:id/submit

GET    /api/v1/admin/applications
GET    /api/v1/admin/analytics
GET    /api/v1/admin/users
PATCH  /api/v1/applications/:id/status
```

All protected routes use JWT Bearer tokens. Admin routes have an additional role guard.

---

## Running Locally

**Prerequisites:** Node.js 18+, a Neon PostgreSQL account, a Groq API key (free)

```bash
git clone https://github.com/Sid-parjane/edufund-ai.git
cd edufund-ai
```

**Backend:**
```bash
cd backend
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, GROQ_API_KEY
npm install
npm run prisma:push
npm run prisma:seed
npm run start:dev
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
npm install
npm run dev
```

**Test accounts (after seed):**
- Admin: admin@edufund.ai / Admin@1234
- Student: priya@example.com / Student@1234

---

## Environment Variables

**backend/.env**
```
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require
JWT_SECRET=your-secret-min-32-chars
GROQ_API_KEY=gsk_...
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
```

---

## What I'd Add Next

- OTP verification via SMS
- Email notifications on status changes
- Document upload (Aadhaar, PAN, admission letter)
- EMI calculator
- Audit logs for admin actions
- Export leads to CSV
- Mobile app

---

## Decisions I Made

**Why NestJS?** Structure and scalability. Decorators, guards, and modules make the codebase easy to extend without turning into spaghetti.

**Why separate scoring and dead lead detection?** Dead leads should be rejected before scoring wastes compute. Two separate concerns, two separate classes.

**Why Groq over OpenAI?** Free tier is generous, Llama 3.1 is fast, and for this use case (structured risk summaries) it performs just as well.

**Why store scoring logs?** Explainability. Every score decision is traceable. You can see exactly which factors helped or hurt a lead.

---

Built by Siddharth Parjane
