/**
 * Abhartbrands Admin Bootstrap Script
 * Run: node scripts/create-admin.mjs
 * 
 * Requires: SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local
let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!serviceKey) {
  try {
    const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
    const match = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)
    if (match) serviceKey = match[1].trim()
  } catch {}
}

const SUPABASE_URL = 'https://gvavdjtdbpnbgntkcgic.supabase.co'

if (!serviceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY')
  console.error('   Add to .env.local: SUPABASE_SERVICE_ROLE_KEY=eyJ...')
  console.error('\n📋 To get it: https://supabase.com/dashboard/project/gvavdjtdbpnbgntkcgic/settings/api')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const adminEmail = process.argv[2] || 'admin@abhartbrands.com'
const adminPassword = process.argv[3] || 'Admin@123456'

async function main() {
  console.log(`\n🔧 Creating admin user: ${adminEmail}`)

  // Create user via Admin API (bypasses email rate limit & confirmation)
  const { data: userData, error: createErr } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      full_name: 'BB Admin',
      phone: '9000000000',
      company_name: 'Abhartbrands',
    }
  })

  let userId

  if (createErr) {
    if (createErr.message?.includes('already registered')) {
      console.log('ℹ️  User already exists, fetching...')
      const { data: list } = await supabase.auth.admin.listUsers()
      const user = list?.users?.find(u => u.email === adminEmail)
      if (!user) { console.error('Could not find existing user'); process.exit(1) }
      userId = user.id
      console.log(`   User ID: ${userId}`)
    } else {
      console.error('❌ Failed to create user:', createErr.message)
      process.exit(1)
    }
  } else {
    userId = userData.user.id
    console.log(`✅ User created! ID: ${userId}`)
  }

  // Upsert profile with admin role
  console.log(`\n🔧 Setting admin role...`)
  const { error: profileErr } = await supabase
    .from('profiles')
    .upsert({ id: userId, phone: '9000000000', company_name: 'Abhartbrands', role: 'admin' })

  if (profileErr) {
    console.error('❌ Failed to set admin profile:', profileErr.message)
    process.exit(1)
  }

  console.log('✅ Admin profile set!')
  console.log('\n🎉 Admin setup complete!')
  console.log(`   Email: ${adminEmail}`)
  console.log(`   Password: ${adminPassword}`)
  console.log(`   Login: http://localhost:3000/auth/login`)
}

main().catch(console.error)
