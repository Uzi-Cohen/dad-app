# Fashion Content Studio - Setup Guide

Welcome to the Fashion Content Studio! This guide will help you set up and run the application.

## 🎯 What This App Does

Turn dress photos into professional promotional videos for Instagram Reels, TikTok, and social media. Upload product photos, customize with your brand style, and generate cinematic videos automatically using AI.

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **PostgreSQL** - [Download here](https://www.postgresql.org/download/)
3. **Redis** - [Download here](https://redis.io/download/)
4. **Git** - [Download here](https://git-scm.com/downloads)

### Optional (for advanced features):
- **FFmpeg** - For video watermarking and processing

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd dad-app

# Install dependencies
npm install
```

### 2. Set Up Database

#### Install PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

#### Create Database

```bash
# Connect to PostgreSQL
psql postgres

# In psql prompt:
CREATE DATABASE fashion_studio;
CREATE USER fashion_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE fashion_studio TO fashion_user;
\q
```

### 3. Set Up Redis

#### Install Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

**Windows:**
Use [Redis for Windows](https://github.com/microsoftarchive/redis/releases) or WSL

### 4. Configure Environment

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Database (update with your PostgreSQL credentials)
DATABASE_URL="postgresql://fashion_user:your_password_here@localhost:5432/fashion_studio?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# AI Providers (add your API keys)
REPLICATE_API_TOKEN=your_replicate_token_here
RUNWAY_API_KEY=your_runway_api_key_here  # Get from https://runwayml.com
FAL_API_KEY=your_fal_api_key_here        # Get from https://fal.ai

# Authentication (generate a random secret)
JWT_SECRET=your_very_long_random_secret_at_least_32_characters_long
JWT_EXPIRES_IN=7d

# Storage
STORAGE_TYPE=local
STORAGE_PATH=./uploads

# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Initialize Database

```bash
# Generate Prisma client and push schema to database
npm run db:push

# Create default users and brand
npm run db:init
```

This will create:
- Admin user: `admin@fashion-studio.local` / `admin123`
- Owner user: `owner@fashion-studio.local` / `fashion123`
- Default brand: "Fashion House"

### 6. Start the Application

You need to run TWO processes:

**Terminal 1 - Web Server:**
```bash
npm run dev
```

**Terminal 2 - Background Worker:**
```bash
npm run worker
```

### 7. Access the App

Open your browser and go to:
```
http://localhost:3000
```

Log in with:
- Email: `owner@fashion-studio.local`
- Password: `fashion123`

## 🔑 Getting API Keys

### Replicate (Fallback Provider)
1. Go to [replicate.com](https://replicate.com)
2. Sign up for an account
3. Go to Account Settings → API Tokens
4. Copy your token to `.env`

### Runway (Primary - Recommended)
1. Go to [runwayml.com](https://runwayml.com)
2. Sign up and subscribe to a plan with API access
3. Go to Settings → API Keys
4. Copy your API key to `.env`

### Fal.ai (Alternative)
1. Go to [fal.ai](https://fal.ai)
2. Sign up for an account
3. Generate an API key
4. Copy to `.env`

## 📁 Project Structure

```
dad-app/
├── app/
│   ├── api/           # API routes
│   │   ├── auth/      # Authentication endpoints
│   │   ├── brands/    # Brand management
│   │   ├── products/  # Product CRUD
│   │   ├── generate/  # Video generation
│   │   └── jobs/      # Job status
│   ├── components/    # React components (UI coming soon)
│   └── page.tsx       # Main page
├── lib/
│   ├── auth.ts        # Authentication logic
│   ├── prisma.ts      # Database client
│   ├── queue.ts       # Job queue system
│   ├── storage.ts     # File storage
│   └── providers/     # AI provider integrations
├── prisma/
│   └── schema.prisma  # Database schema
├── scripts/
│   ├── worker.ts      # Background job worker
│   └── init-db.ts     # Database initialization
└── public/
    └── uploads/       # Uploaded files (created automatically)
```

## 🎬 How to Use

### 1. Create a Brand (Brand Kit)

Your brand settings control how videos look:
- Logo and watermark
- Default prompt style
- Video templates

### 2. Add Products (Dresses)

For each dress:
- SKU and name
- Price, fabric, colors, sizes
- Upload 1-6 product photos

### 3. Generate Videos

1. Select a product
2. Choose photos to use
3. Pick a template:
   - **Runway Cinematic**: Slow dramatic push-in
   - **Mannequin Spin**: 360° rotation
   - **Fabric Macro**: Close-up texture details
   - **Runway Spotlight**: Stage presentation
4. Click Generate
5. Job is queued and processed in background
6. Download when ready

### 4. Export & Share

Videos are optimized for:
- Instagram Reels (9:16)
- TikTok (9:16)
- Instagram Feed (1:1)
- Instagram Portrait (4:5)

## 🛠️ Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run worker           # Start background worker
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:push          # Push schema changes
npm run db:studio        # Open Prisma Studio (DB GUI)
npm run db:init          # Initialize with default data

# Maintenance
npm run lint             # Run linter
```

## 🐛 Troubleshooting

### "Cannot connect to PostgreSQL"
- Ensure PostgreSQL is running: `brew services list` (macOS) or `systemctl status postgresql` (Linux)
- Check DATABASE_URL in `.env` matches your credentials
- Test connection: `psql $DATABASE_URL`

### "Cannot connect to Redis"
- Ensure Redis is running: `brew services list` (macOS) or `systemctl status redis` (Linux)
- Test connection: `redis-cli ping` (should return "PONG")

### "Worker not processing jobs"
- Make sure worker is running in a separate terminal: `npm run worker`
- Check Redis connection in worker logs
- View jobs in Prisma Studio: `npm run db:studio`

### "Video generation fails"
- Verify API keys in `.env`
- Check worker logs for error messages
- Try different provider (REPLICATE, RUNWAY, FAL_PIKA, FAL_LUMA)

### "Upload directory not found"
- The `public/uploads` directory is created automatically
- Ensure write permissions: `chmod -R 755 public/uploads`

## 📊 Monitoring

### View Database
```bash
npm run db:studio
```
Opens Prisma Studio at `http://localhost:5555`

### Check Queue Status
View active/waiting/failed jobs in Prisma Studio or via API:
```bash
curl http://localhost:3000/api/jobs
```

### Worker Logs
The worker terminal shows real-time job processing:
```
✅ Video generation completed: abc-123-def
❌ Video generation failed: xyz-456-abc
```

## 🔐 Security Notes

1. **Change default passwords** after first login
2. **Use strong JWT_SECRET** in production
3. **Never commit `.env`** to git
4. **Enable HTTPS** in production
5. **Set up proper CORS** for API routes

## 📚 Next Steps

- [ ] Set up production PostgreSQL (Railway, Supabase, AWS RDS)
- [ ] Set up production Redis (Upstash, Redis Cloud)
- [ ] Deploy to Vercel/Railway/DigitalOcean
- [ ] Configure S3 for production file storage
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Add payment integration (Stripe)

## 🆘 Support

If you encounter issues:

1. Check this SETUP.md guide
2. Review error logs in terminal
3. Check Prisma Studio for database state
4. Verify all services are running (PostgreSQL, Redis, Worker)
5. Ensure API keys are valid

## 🎉 You're Ready!

Your Fashion Content Studio is now set up and ready to generate amazing product videos!

Start by:
1. Logging in at `http://localhost:3000`
2. Creating your brand kit
3. Adding your first product
4. Uploading photos
5. Generating your first video!
