"use client"

import { 
  Users, 
  Settings, 
  Car as CarIcon, 
  Fuel, 
  Gauge, 
  Palette, 
  Calendar,
  CheckCircle,
  Wind,
  Thermometer,
  Volume2,
  Smartphone,
  Shield,
  Camera,
  Zap,
  Wifi,
  Bluetooth,
  Navigation,
  Sun,
  Snowflake,
  Eye,
  AlertTriangle,
  Car as CarIcon2
} from "lucide-react"

// Feature icon mapping
const FEATURE_ICONS: { [key: string]: any } = {
  // Basic Info
  seats: Users,
  doors: CarIcon,
  mileage: Gauge,
  fuel_type: Fuel,
  transmission: Settings,
  year: Calendar,
  color: Palette,
  
  // Comfort
  air_conditioning: Wind,
  heated_seats: Thermometer,
  leather_seats: CarIcon2,
  power_windows: CarIcon2,
  power_steering: CarIcon2,
  cruise_control: CarIcon2,
  sunroof: Sun,
  
  // Technology
  gps_navigation: Navigation,
  bluetooth: Bluetooth,
  usb_ports: Smartphone,
  aux_input: Volume2,
  apple_carplay: Smartphone,
  android_auto: Smartphone,
  premium_sound: Volume2,
  wireless_charging: Zap,
  
  // Safety
  abs_brakes: Shield,
  airbags: Shield,
  backup_camera: Camera,
  parking_sensors: Eye,
  lane_assist: AlertTriangle,
  blind_spot_monitoring: Eye,
  adaptive_cruise: CarIcon2,
  emergency_braking: Shield
}

interface CarFeature {
  id: string
  value: string | number | boolean
  label: string
  icon: string
  type: 'text' | 'number' | 'boolean' | 'select'
  suffix?: string
}

interface CarFeaturesDisplayProps {
  features: CarFeature[]
  showBasicInfo?: boolean
  showComfort?: boolean
  showTechnology?: boolean
  showSafety?: boolean
}

export function CarFeaturesDisplay({ 
  features, 
  showBasicInfo = true, 
  showComfort = true, 
  showTechnology = true, 
  showSafety = true 
}: CarFeaturesDisplayProps) {
  
  // Categorize features
  const basicFeatures = features.filter(f => 
    ['seats', 'doors', 'mileage', 'fuel_type', 'transmission', 'year', 'color'].includes(f.id)
  )
  
  const comfortFeatures = features.filter(f => 
    ['air_conditioning', 'heated_seats', 'leather_seats', 'power_windows', 'power_steering', 'cruise_control', 'sunroof'].includes(f.id)
  )
  
  const technologyFeatures = features.filter(f => 
    ['gps_navigation', 'bluetooth', 'usb_ports', 'aux_input', 'apple_carplay', 'android_auto', 'premium_sound', 'wireless_charging'].includes(f.id)
  )
  
  const safetyFeatures = features.filter(f => 
    ['abs_brakes', 'airbags', 'backup_camera', 'parking_sensors', 'lane_assist', 'blind_spot_monitoring', 'adaptive_cruise', 'emergency_braking'].includes(f.id)
  )

  const renderFeature = (feature: CarFeature) => {
    const Icon = FEATURE_ICONS[feature.id] || CarIcon
    
    if (feature.type === 'boolean') {
      return (
        <div key={feature.id} className="flex items-center space-x-2">
          <Icon className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium">{feature.label}</span>
          {feature.value && <CheckCircle className="h-4 w-4 text-green-500" />}
        </div>
      )
    }
    
    return (
      <div key={feature.id} className="flex items-center space-x-2">
        <Icon className="h-5 w-5 text-gray-600" />
        <span className="text-sm font-medium">
          {feature.label}: {feature.value}
          {feature.suffix && ` ${feature.suffix}`}
        </span>
      </div>
    )
  }

  const renderFeatureSection = (title: string, featureList: CarFeature[], show: boolean) => {
    if (!show || featureList.length === 0) return null
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {featureList.map(renderFeature)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {renderFeatureSection("Basic Information", basicFeatures, showBasicInfo)}
      {renderFeatureSection("Comfort Features", comfortFeatures, showComfort)}
      {renderFeatureSection("Technology Features", technologyFeatures, showTechnology)}
      {renderFeatureSection("Safety Features", safetyFeatures, showSafety)}
    </div>
  )
}

// Compact version for smaller displays
export function CarFeaturesCompact({ features }: { features: CarFeature[] }) {
  const basicFeatures = features.filter(f => 
    ['seats', 'doors', 'mileage', 'fuel_type', 'transmission', 'year', 'color'].includes(f.id)
  )
  
  const booleanFeatures = features.filter(f => f.type === 'boolean' && f.value === true)
  
  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Vehicle Details</h3>
        <div className="grid grid-cols-2 gap-2">
          {basicFeatures.map(feature => {
            const Icon = FEATURE_ICONS[feature.id] || CarIcon
            return (
              <div key={feature.id} className="flex items-center space-x-2">
                <Icon className="h-4 w-4 text-gray-600" />
                <span className="text-xs font-medium">
                  {feature.label}: {feature.value}
                  {feature.suffix && ` ${feature.suffix}`}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Enabled Features */}
      {booleanFeatures.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Included Features</h3>
          <div className="flex flex-wrap gap-2">
            {booleanFeatures.map(feature => {
              const Icon = FEATURE_ICONS[feature.id] || CarIcon
              return (
                <div key={feature.id} className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-full">
                  <Icon className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-800">{feature.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
