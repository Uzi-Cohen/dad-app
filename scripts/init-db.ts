#!/usr/bin/env tsx

/**
 * Database Initialization Script
 *
 * This script:
 * 1. Generates Prisma client
 * 2. Creates a default admin user if none exists
 * 3. Creates a default brand for testing
 *
 * Usage:
 *   tsx scripts/init-db.ts
 */

import { prisma } from '../lib/prisma'
import { hashPassword } from '../lib/auth'

async function main() {
  console.log('🔧 Initializing database...\n')

  // Check if admin user exists
  const adminCount = await prisma.user.count({
    where: { role: 'ADMIN' },
  })

  if (adminCount === 0) {
    console.log('👤 Creating default admin user...')

    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    const hashedPassword = await hashPassword(adminPassword)

    const admin = await prisma.user.create({
      data: {
        email: 'admin@fashion-studio.local',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
      },
    })

    console.log('✅ Admin user created:')
    console.log(`   Email: admin@fashion-studio.local`)
    console.log(`   Password: ${adminPassword}`)
    console.log(`   ID: ${admin.id}\n`)
  } else {
    console.log('✅ Admin user already exists\n')
  }

  // Check if owner user exists (for dad)
  const ownerCount = await prisma.user.count({
    where: { role: 'OWNER' },
  })

  if (ownerCount === 0) {
    console.log('👤 Creating default owner user (for dad)...')

    const ownerPassword = process.env.OWNER_PASSWORD || 'fashion123'
    const hashedPassword = await hashPassword(ownerPassword)

    const owner = await prisma.user.create({
      data: {
        email: 'owner@fashion-studio.local',
        password: hashedPassword,
        name: 'Fashion Owner',
        role: 'OWNER',
      },
    })

    console.log('✅ Owner user created:')
    console.log(`   Email: owner@fashion-studio.local`)
    console.log(`   Password: ${ownerPassword}`)
    console.log(`   ID: ${owner.id}\n`)

    // Create a default brand for the owner
    console.log('🏢 Creating default brand...')

    const brand = await prisma.brand.create({
      data: {
        userId: owner.id,
        name: 'Fashion House',
        watermarkPosition: 'BOTTOM_RIGHT',
        watermarkOpacity: 0.7,
        defaultPrompt:
          'High-end fashion product video of a dress, realistic fabric texture preserved, subtle cinematic camera push-in, soft studio lighting, clean background, elegant boutique look, sharp stitching, natural folds, no distortion.',
        negativePrompt:
          'no extra limbs, no distorted fabric, no warped patterns, no blurry details, no watermarks, no text',
      },
    })

    console.log('✅ Brand created:')
    console.log(`   Name: ${brand.name}`)
    console.log(`   ID: ${brand.id}\n`)
  } else {
    console.log('✅ Owner user already exists\n')
  }

  console.log('🎉 Database initialization complete!\n')
  console.log('📝 You can now:')
  console.log('   1. Start the dev server: npm run dev')
  console.log('   2. Start the worker: npm run worker')
  console.log('   3. Log in with the credentials above\n')
}

main()
  .catch((error) => {
    console.error('❌ Error initializing database:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
