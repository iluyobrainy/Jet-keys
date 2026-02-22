"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Globe,
  Save,
  Upload,
  Image as ImageIcon,
  Type,
  Palette,
  Settings,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { useEffect, useState } from "react"
import { websiteService } from "@/lib/admin-services"

interface WebsiteSettings {
  site_name: string
  site_description: string
  site_keywords: string
  hero_title: string
  hero_subtitle: string
  hero_image: string
  about_title: string
  about_description: string
  about_image: string
  contact_email: string
  contact_phone: string
  contact_address: string
  social_facebook: string
  social_twitter: string
  social_instagram: string
  social_linkedin: string
  primary_color: string
  secondary_color: string
  accent_color: string
  logo_url: string
  favicon_url: string
  maintenance_mode: boolean
  maintenance_message: string
  google_analytics_id: string
  google_maps_api_key: string
  payment_gateway_public_key: string
  payment_gateway_secret_key: string
  email_smtp_host: string
  email_smtp_port: number
  email_smtp_username: string
  email_smtp_password: string
  email_from_address: string
  email_from_name: string
}

export default function WebsiteSettingsPage() {
  const [settings, setSettings] = useState<WebsiteSettings>({
    site_name: "Jet & Keys",
    site_description: "Premium car rental and private jet services",
    site_keywords: "car rental, jet charter, luxury transportation, nigeria",
    hero_title: "Premium Car Rental & Private Jet Services",
    hero_subtitle: "Experience luxury transportation with unmatched quality and reliability",
    hero_image: "",
    about_title: "About Jet & Keys",
    about_description: "We provide premium car rental and private jet services with unmatched quality and reliability.",
    about_image: "",
    contact_email: "info@jetandkeys.com",
    contact_phone: "+234 800 000 0000",
    contact_address: "Lagos, Nigeria",
    social_facebook: "",
    social_twitter: "",
    social_instagram: "",
    social_linkedin: "",
    primary_color: "#000000",
    secondary_color: "#f97316",
    accent_color: "#fbbf24",
    logo_url: "",
    favicon_url: "",
    maintenance_mode: false,
    maintenance_message: "We're currently performing maintenance. Please check back later.",
    google_analytics_id: "",
    google_maps_api_key: "",
    payment_gateway_public_key: "",
    payment_gateway_secret_key: "",
    email_smtp_host: "",
    email_smtp_port: 587,
    email_smtp_username: "",
    email_smtp_password: "",
    email_from_address: "",
    email_from_name: ""
  })
  
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await websiteService.getWebsiteSettings()
        setSettings(data)
      } catch (error) {
        console.error('Error fetching website settings:', error)
      }
    }

    fetchSettings()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await websiteService.updateWebsiteSettings(settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "content", label: "Content", icon: Type },
    { id: "design", label: "Design", icon: Palette },
    { id: "social", label: "Social Media", icon: Settings },
    { id: "integrations", label: "Integrations", icon: Settings },
    { id: "email", label: "Email", icon: Settings }
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Website Settings</h1>
            <p className="text-gray-600">Manage your website content and configuration</p>
          </div>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>

        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">Settings saved successfully!</span>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* General Settings */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    name="site_name"
                    value={settings.site_name}
                    onChange={handleInputChange}
                    placeholder="Jet & Keys"
                  />
                </div>
                <div>
                  <Label htmlFor="site_description">Site Description</Label>
                  <Textarea
                    id="site_description"
                    name="site_description"
                    value={settings.site_description}
                    onChange={handleInputChange}
                    placeholder="Brief description of your business"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="site_keywords">SEO Keywords</Label>
                  <Input
                    id="site_keywords"
                    name="site_keywords"
                    value={settings.site_keywords}
                    onChange={handleInputChange}
                    placeholder="car rental, jet charter, luxury transportation"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    value={settings.contact_email}
                    onChange={handleInputChange}
                    placeholder="info@jetandkeys.com"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    value={settings.contact_phone}
                    onChange={handleInputChange}
                    placeholder="+234 800 000 0000"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_address">Business Address</Label>
                  <Textarea
                    id="contact_address"
                    name="contact_address"
                    value={settings.contact_address}
                    onChange={handleInputChange}
                    placeholder="Your business address"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Mode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="maintenance_mode"
                    name="maintenance_mode"
                    checked={settings.maintenance_mode}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <Label htmlFor="maintenance_mode">Enable Maintenance Mode</Label>
                </div>
                {settings.maintenance_mode && (
                  <div>
                    <Label htmlFor="maintenance_message">Maintenance Message</Label>
                    <Textarea
                      id="maintenance_message"
                      name="maintenance_message"
                      value={settings.maintenance_message}
                      onChange={handleInputChange}
                      placeholder="Message to show during maintenance"
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content Settings */}
        {activeTab === "content" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hero_title">Hero Title</Label>
                  <Input
                    id="hero_title"
                    name="hero_title"
                    value={settings.hero_title}
                    onChange={handleInputChange}
                    placeholder="Main headline for your homepage"
                  />
                </div>
                <div>
                  <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
                  <Textarea
                    id="hero_subtitle"
                    name="hero_subtitle"
                    value={settings.hero_subtitle}
                    onChange={handleInputChange}
                    placeholder="Supporting text for your headline"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="hero_image">Hero Image URL</Label>
                  <Input
                    id="hero_image"
                    name="hero_image"
                    value={settings.hero_image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/hero-image.jpg"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="about_title">About Title</Label>
                  <Input
                    id="about_title"
                    name="about_title"
                    value={settings.about_title}
                    onChange={handleInputChange}
                    placeholder="About Us"
                  />
                </div>
                <div>
                  <Label htmlFor="about_description">About Description</Label>
                  <Textarea
                    id="about_description"
                    name="about_description"
                    value={settings.about_description}
                    onChange={handleInputChange}
                    placeholder="Tell your story"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="about_image">About Image URL</Label>
                  <Input
                    id="about_image"
                    name="about_image"
                    value={settings.about_image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/about-image.jpg"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Design Settings */}
        {activeTab === "design" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Color Scheme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="primary_color">Primary Color</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        id="primary_color"
                        name="primary_color"
                        value={settings.primary_color}
                        onChange={handleInputChange}
                        className="w-12 h-10 border border-gray-300 rounded"
                      />
                      <Input
                        value={settings.primary_color}
                        onChange={handleInputChange}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondary_color">Secondary Color</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        id="secondary_color"
                        name="secondary_color"
                        value={settings.secondary_color}
                        onChange={handleInputChange}
                        className="w-12 h-10 border border-gray-300 rounded"
                      />
                      <Input
                        value={settings.secondary_color}
                        onChange={handleInputChange}
                        placeholder="#f97316"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accent_color">Accent Color</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        id="accent_color"
                        name="accent_color"
                        value={settings.accent_color}
                        onChange={handleInputChange}
                        className="w-12 h-10 border border-gray-300 rounded"
                      />
                      <Input
                        value={settings.accent_color}
                        onChange={handleInputChange}
                        placeholder="#fbbf24"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Brand Assets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    name="logo_url"
                    value={settings.logo_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div>
                  <Label htmlFor="favicon_url">Favicon URL</Label>
                  <Input
                    id="favicon_url"
                    name="favicon_url"
                    value={settings.favicon_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Social Media Settings */}
        {activeTab === "social" && (
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="social_facebook">Facebook URL</Label>
                <Input
                  id="social_facebook"
                  name="social_facebook"
                  value={settings.social_facebook}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div>
                <Label htmlFor="social_twitter">Twitter URL</Label>
                <Input
                  id="social_twitter"
                  name="social_twitter"
                  value={settings.social_twitter}
                  onChange={handleInputChange}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
              <div>
                <Label htmlFor="social_instagram">Instagram URL</Label>
                <Input
                  id="social_instagram"
                  name="social_instagram"
                  value={settings.social_instagram}
                  onChange={handleInputChange}
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>
              <div>
                <Label htmlFor="social_linkedin">LinkedIn URL</Label>
                <Input
                  id="social_linkedin"
                  name="social_linkedin"
                  value={settings.social_linkedin}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Integrations Settings */}
        {activeTab === "integrations" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                  <Input
                    id="google_analytics_id"
                    name="google_analytics_id"
                    value={settings.google_analytics_id}
                    onChange={handleInputChange}
                    placeholder="GA-XXXXXXXXX-X"
                  />
                </div>
                <div>
                  <Label htmlFor="google_maps_api_key">Google Maps API Key</Label>
                  <Input
                    id="google_maps_api_key"
                    name="google_maps_api_key"
                    value={settings.google_maps_api_key}
                    onChange={handleInputChange}
                    placeholder="Your Google Maps API key"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Gateway</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="payment_gateway_public_key">Public Key</Label>
                  <Input
                    id="payment_gateway_public_key"
                    name="payment_gateway_public_key"
                    value={settings.payment_gateway_public_key}
                    onChange={handleInputChange}
                    placeholder="Your payment gateway public key"
                  />
                </div>
                <div>
                  <Label htmlFor="payment_gateway_secret_key">Secret Key</Label>
                  <Input
                    id="payment_gateway_secret_key"
                    name="payment_gateway_secret_key"
                    type="password"
                    value={settings.payment_gateway_secret_key}
                    onChange={handleInputChange}
                    placeholder="Your payment gateway secret key"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Email Settings */}
        {activeTab === "email" && (
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email_smtp_host">SMTP Host</Label>
                  <Input
                    id="email_smtp_host"
                    name="email_smtp_host"
                    value={settings.email_smtp_host}
                    onChange={handleInputChange}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="email_smtp_port">SMTP Port</Label>
                  <Input
                    id="email_smtp_port"
                    name="email_smtp_port"
                    type="number"
                    value={settings.email_smtp_port}
                    onChange={handleInputChange}
                    placeholder="587"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email_smtp_username">SMTP Username</Label>
                <Input
                  id="email_smtp_username"
                  name="email_smtp_username"
                  value={settings.email_smtp_username}
                  onChange={handleInputChange}
                  placeholder="your-email@gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="email_smtp_password">SMTP Password</Label>
                <Input
                  id="email_smtp_password"
                  name="email_smtp_password"
                  type="password"
                  value={settings.email_smtp_password}
                  onChange={handleInputChange}
                  placeholder="Your email password or app password"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email_from_address">From Email Address</Label>
                  <Input
                    id="email_from_address"
                    name="email_from_address"
                    type="email"
                    value={settings.email_from_address}
                    onChange={handleInputChange}
                    placeholder="noreply@jetandkeys.com"
                  />
                </div>
                <div>
                  <Label htmlFor="email_from_name">From Name</Label>
                  <Input
                    id="email_from_name"
                    name="email_from_name"
                    value={settings.email_from_name}
                    onChange={handleInputChange}
                    placeholder="Jet & Keys"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}





