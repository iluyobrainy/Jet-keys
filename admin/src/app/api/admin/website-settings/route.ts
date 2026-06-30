import { NextRequest, NextResponse } from 'next/server'
import { requireAdminContext, unauthorizedAdminResponse } from '@/lib/admin-auth-server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const defaultWebsiteSettings = {
  site_name: 'Jet & Keys',
  site_description: 'Premium car rental and private jet services',
  site_keywords: 'car rental, jet charter, luxury transportation, nigeria',
  hero_title: 'Premium Car Rental & Private Jet Services',
  hero_subtitle: 'Experience luxury transportation with unmatched quality and reliability',
  hero_image: '',
  about_title: 'About Jet & Keys',
  about_description:
    'We provide premium car rental and private jet services with unmatched quality and reliability.',
  about_image: '',
  contact_email: 'info@jetandkeys.com',
  contact_phone: '+234 800 000 0000',
  contact_address: 'Lagos, Nigeria',
  social_facebook: '',
  social_twitter: '',
  social_instagram: '',
  social_linkedin: '',
  primary_color: '#000000',
  secondary_color: '#f97316',
  accent_color: '#fbbf24',
  logo_url: '',
  favicon_url: '',
  maintenance_mode: false,
  maintenance_message: "We're currently performing maintenance. Please check back later.",
  google_analytics_id: '',
  google_maps_api_key: '',
  payment_gateway_public_key: '',
  payment_gateway_secret_key: '',
  email_smtp_host: '',
  email_smtp_port: 587,
  email_smtp_username: '',
  email_smtp_password: '',
  email_from_address: '',
  email_from_name: '',
}

function coerceSettingValue(key: string, value: string | null) {
  const defaultValue = defaultWebsiteSettings[key as keyof typeof defaultWebsiteSettings]

  if (defaultValue === undefined || value === null) {
    return value ?? ''
  }

  if (typeof defaultValue === 'boolean') {
    return value === 'true'
  }

  if (typeof defaultValue === 'number') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : defaultValue
  }

  return value
}

function inferSettingType(value: unknown) {
  if (typeof value === 'boolean') {
    return 'boolean'
  }

  if (typeof value === 'number') {
    return 'number'
  }

  if (value && typeof value === 'object') {
    return 'json'
  }

  return 'string'
}

function serializeSettingValue(value: unknown) {
  if (value && typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value ?? '')
}

export async function GET(request: NextRequest) {
  if (!(await requireAdminContext(request))) {
    return unauthorizedAdminResponse()
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('website_settings')
      .select('*')
      .order('key')

    if (error) {
      throw error
    }

    const settings = { ...defaultWebsiteSettings } as Record<string, unknown>
    for (const setting of data || []) {
      settings[setting.key] = coerceSettingValue(setting.key, setting.value)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching website settings:', error)
    return NextResponse.json(defaultWebsiteSettings)
  }
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdminContext(request))) {
    return unauthorizedAdminResponse()
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>
    const settingsArray = Object.entries(payload).map(([key, value]) => ({
      key,
      value: serializeSettingValue(value),
      type: inferSettingType(value),
    }))

    const { error } = await supabaseAdmin
      .from('website_settings')
      .upsert(settingsArray, { onConflict: 'key' })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating website settings:', error)
    return NextResponse.json({ error: 'Failed to update website settings' }, { status: 500 })
  }
}
