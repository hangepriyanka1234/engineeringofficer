# Engineering Officer BY SP - Civil Engineering Preparation Platform 🏗️🇮🇳

> **Comprehensive Exam Preparation Platform for MPSC MES, WRD, PWD, BMC, ZP, MahaTransco, and SSC JE Civil Engineering Aspirants.**

---

## 🚀 Key Features

- **20,000+ Question Bank & PYQs**: 24+ Civil Engineering subjects with comprehensive bilingual explanations (Marathi & English).
- **Realistic TCS iON CBT Engine**: 100-question timed mock simulations with color-coded question palette, section navigation, and instant scorecards.
- **Formula & Design Lab**: Interactive engineering calculators for RCC (LSM/WSM), SOM, Soil Mechanics, Fluid Mechanics, Steel Design, and Surveying.
- **Mistake Notebook & Revision Scheduler**: Targeted spaced-repetition practice for incorrect answers.
- **Monetization & Plans**: Razorpay checkout integration with instant Pass activation, GST invoicing, and dynamic coupon management.
- **Super Admin Operations Console**: Question curation, live test scheduler, AI Gateway cost controls, recruitment notifications publisher, and database metrics.
- **Real-Time Database Sync**: Ready for Supabase PostgreSQL with Row Level Security (RLS).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas-Confetti, Recharts
- **Backend / API**: Node.js, Express, TypeScript (TSX in dev, bundled CJS in production)
- **Database**: Supabase / PostgreSQL (Schema provided in `supabase/schema.sql`)
- **Hosting & Container**: Google Cloud Run & Docker ready

---

## 📦 Quick Start (Local Setup)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/engineering-officer-sp.git
cd engineering-officer-sp
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your credentials:
```env
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. Setup Database (Supabase)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open **SQL Editor** -> **New Query**
3. Copy & paste the entire content of `supabase/schema.sql` and run it.

### 5. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 📜 Build & Production

```bash
npm run build
npm start
```

---

## 👨‍💻 Developed with ❤️ for Maharashtra Civil Engineering Aspirants.
