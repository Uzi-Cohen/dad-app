# Fashion Content Studio

**Transform dress photos into cinematic promotional videos**

A production-ready web application for fashion businesses to create professional social media content. Upload product photos and generate stunning video promos for Instagram Reels, TikTok, and other platforms.

---

## 🎬 What It Does

**Input:** Product photos of dresses
**Output:** Professional 5-10 second videos ready for social media

- Cinematic camera movements
- Multiple video templates (runway, spin, closeup)
- Brand watermarking
- Export presets for all platforms (9:16, 1:1, 4:5)
- Background job processing
- Multi-provider AI (Runway, Fal.ai, Replicate)

---

## ⚡ Quick Start

**📖 For detailed setup instructions, see [SETUP.md](./SETUP.md)**

### Minimum Requirements

1. **Node.js 18+**
2. **PostgreSQL** (database)
3. **Redis** (job queue)
4. **AI Provider API Key** (Runway, Fal.ai, or Replicate)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment (copy and edit .env)
cp .env.example .env

# 3. Initialize database
npm run db:push
npm run db:init

# 4. Start the app (2 terminals needed)
# Terminal 1: Web server
npm run dev

# Terminal 2: Background worker
npm run worker
```

**🌐 Access:** Open [http://localhost:3000](http://localhost:3000)

**🔑 Default Login:**
- Email: `owner@fashion-studio.local`
- Password: `fashion123`

---

## 🏗️ Architecture

This is a **full-stack production system**, not a prototype.

### Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **Queue:** Redis + BullMQ
- **AI Providers:** Runway (primary), Fal.ai (Pika/Luma), Replicate (fallback)
- **Storage:** Local filesystem (dev) / S3-compatible (production)

### Key Features

✅ **Multi-user with authentication** (JWT-based)
✅ **Role-based access control** (Admin, Owner, Editor)
✅ **Product catalog** (SKU, pricing, fabric, colors, sizes)
✅ **Brand kit** (logo, watermark, prompt templates)
✅ **Background job processing** (async video generation)
✅ **Provider abstraction** (swap AI providers without code changes)
✅ **Real-time job tracking** (queue status, progress updates)
✅ **Multi-format exports** (Instagram, TikTok, Square)

---

## 📁 Project Structure

```
dad-app/
├── app/
│   ├── api/              # API endpoints
│   │   ├── auth/         # Login, register, me
│   │   ├── brands/       # Brand CRUD
│   │   ├── products/     # Product + asset management
│   │   ├── generate/     # Video generation
│   │   └── jobs/         # Job status tracking
│   └── components/       # React components (UI)
├── lib/
│   ├── auth.ts           # JWT authentication
│   ├── prisma.ts         # Database client
│   ├── queue.ts          # BullMQ job queue
│   ├── storage.ts        # File uploads
│   └── providers/        # AI provider abstraction
│       ├── replicate.ts  # Replicate provider
│       ├── runway.ts     # Runway provider
│       ├── fal.ts        # Fal.ai (Pika/Luma)
│       └── factory.ts    # Provider factory
├── prisma/
│   └── schema.prisma     # Database schema
├── scripts/
│   ├── worker.ts         # Background job worker
│   └── init-db.ts        # Database seeding
└── public/uploads/       # Uploaded files
```

---

## 🎯 Core Workflow

1. **User uploads dress photos** → stored in database + filesystem
2. **Selects video template** (runway, spin, macro, spotlight)
3. **Clicks "Generate"** → job created and queued
4. **Worker picks up job** → calls AI provider API
5. **Video generated** → downloaded and stored
6. **User exports** → multiple aspect ratios for social platforms

---

## 🔧 Available Commands

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run worker           # Start background worker
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:push          # Push schema to PostgreSQL
npm run db:studio        # Open Prisma Studio (DB GUI)
npm run db:init          # Seed default users/brands
npm run db:generate      # Generate Prisma client

# Maintenance
npm run lint             # Run ESLint
```

---

## 🔑 Getting API Keys

You need at least **one** AI provider configured:

### Runway (Recommended - Best Quality)
1. Go to [runwayml.com](https://runwayml.com)
2. Subscribe to API plan
3. Copy API key to `.env` → `RUNWAY_API_KEY`

### Fal.ai (Fast Iterations)
1. Go to [fal.ai](https://fal.ai)
2. Generate API key
3. Copy to `.env` → `FAL_API_KEY`

### Replicate (Fallback)
1. Go to [replicate.com](https://replicate.com)
2. Get API token
3. Copy to `.env` → `REPLICATE_API_TOKEN`

---

## 📊 Monitoring & Debugging

### View Database
```bash
npm run db:studio
```
Opens Prisma Studio at `http://localhost:5555`

### Check Job Queue
- View jobs in Prisma Studio (GenerationJob table)
- Worker logs show real-time processing
- API endpoint: `GET /api/jobs/:id`

### Common Issues

**"Cannot connect to database"**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`

**"Worker not processing"**
- Ensure Redis is running
- Run `npm run worker` in separate terminal

**"Video generation fails"**
- Check API key validity
- View error in worker logs
- Try different provider

---

## 🚀 Production Deployment

For production deployment:

1. **Database:** Use managed PostgreSQL (Railway, Supabase, AWS RDS)
2. **Redis:** Use managed Redis (Upstash, Redis Cloud)
3. **Storage:** Use S3 or Cloudflare R2
4. **Hosting:** Vercel (web) + Railway/Fly.io (worker)
5. **Environment:** Set all `.env` variables in production
6. **Security:** Use strong `JWT_SECRET`, enable HTTPS

See [SETUP.md](./SETUP.md) for detailed production setup.

---

## 📖 Full Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup guide
- **[QUICKSTART.md](./QUICKSTART.md)** - Original quickstart (legacy)
- **Database Schema** - See `prisma/schema.prisma`
- **API Routes** - See `app/api/` directory

---

## 🛡️ Security

- JWT-based authentication
- Role-based access control
- Server-side API calls (no client-side keys)
- File upload validation
- SQL injection protection (Prisma)

---

## 📝 License

MIT License - Free for personal and commercial use

---

## 🆘 Support

1. Read [SETUP.md](./SETUP.md)
2. Check database with `npm run db:studio`
3. Review worker logs for errors
4. Verify services running (PostgreSQL, Redis, Worker)

---

**Built for fashion businesses who need professional content, fast.**
