"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Users, 
  Settings, 
  Car as CarIcon, 
  Fuel, 
  Gauge, 
  Palette, 
  Calendar,
  CheckCircle,
  X,
  Plus,
  Edit,
  Trash2,
  Save,
  ArrowLeft
} from "lucide-react"

// Define feature types
interface FeatureDefinition {
  id: string
  icon: any
  label: string
  type: 'text' | 'number' | 'boolean' | 'select'
  placeholder?: string
  suffix?: string
  options?: string[]
}

// Define all available features with their icons and categories
export const AVAILABLE_FEATURES: { [key: string]: FeatureDefinition[] } = {
  // Basic Info Features
  basic: [
    { id: 'seats', icon: Users, label: 'Seats', type: 'number', placeholder: 'e.g., 5' },
    { id: 'doors', icon: CarIcon, label: 'Doors', type: 'number', placeholder: 'e.g., 4' },
    { id: 'mileage', icon: Gauge, label: 'Mileage', type: 'number', placeholder: 'e.g., 50000', suffix: 'km' },
    { id: 'fuel_type', icon: Fuel, label: 'Fuel Type', type: 'select', options: ['Petrol', 'Diesel', 'Hybrid', 'Electric'] },
    { id: 'transmission', icon: Settings, label: 'Transmission', type: 'select', options: ['Manual', 'Automatic', 'CVT'] },
    { id: 'year', icon: Calendar, label: 'Year', type: 'number', placeholder: 'e.g., 2023' },
    { id: 'color', icon: Palette, label: 'Color', type: 'text', placeholder: 'e.g., Black' }
  ],
  
  // Comfort Features
  comfort: [
    { id: 'air_conditioning', icon: CarIcon, label: 'Air Conditioning', type: 'boolean' },
    { id: 'heated_seats', icon: CarIcon, label: 'Heated Seats', type: 'boolean' },
    { id: 'leather_seats', icon: CarIcon, label: 'Leather Seats', type: 'boolean' },
    { id: 'power_windows', icon: CarIcon, label: 'Power Windows', type: 'boolean' },
    { id: 'power_steering', icon: CarIcon, label: 'Power Steering', type: 'boolean' },
    { id: 'cruise_control', icon: CarIcon, label: 'Cruise Control', type: 'boolean' },
    { id: 'sunroof', icon: CarIcon, label: 'Sunroof', type: 'boolean' }
  ],
  
  // Technology Features
  technology: [
    { id: 'gps_navigation', icon: CarIcon, label: 'GPS Navigation', type: 'boolean' },
    { id: 'bluetooth', icon: CarIcon, label: 'Bluetooth', type: 'boolean' },
    { id: 'usb_ports', icon: CarIcon, label: 'USB Ports', type: 'boolean' },
    { id: 'aux_input', icon: CarIcon, label: 'Aux Input', type: 'boolean' },
    { id: 'apple_carplay', icon: CarIcon, label: 'Apple CarPlay', type: 'boolean' },
    { id: 'android_auto', icon: CarIcon, label: 'Android Auto', type: 'boolean' },
    { id: 'premium_sound', icon: CarIcon, label: 'Premium Sound System', type: 'boolean' },
    { id: 'wireless_charging', icon: CarIcon, label: 'Wireless Charging', type: 'boolean' }
  ],
  
  // Safety Features
  safety: [
    { id: 'abs_brakes', icon: CarIcon, label: 'ABS Brakes', type: 'boolean' },
    { id: 'airbags', icon: CarIcon, label: 'Airbags', type: 'boolean' },
    { id: 'backup_camera', icon: CarIcon, label: 'Backup Camera', type: 'boolean' },
    { id: 'parking_sensors', icon: CarIcon, label: 'Parking Sensors', type: 'boolean' },
    { id: 'lane_assist', icon: CarIcon, label: 'Lane Assist', type: 'boolean' },
    { id: 'blind_spot_monitoring', icon: CarIcon, label: 'Blind Spot Monitoring', type: 'boolean' },
    { id: 'adaptive_cruise', icon: CarIcon, label: 'Adaptive Cruise Control', type: 'boolean' },
    { id: 'emergency_braking', icon: CarIcon, label: 'Emergency Braking', type: 'boolean' }
  ]
}

interface CarFeature {
  id: string
  value: string | number | boolean
  label: string
  icon: any
  type: 'text' | 'number' | 'boolean' | 'select'
  options?: string[]
  placeholder?: string
  suffix?: string
}

interface CarFeatureSelectorProps {
  initialFeatures?: CarFeature[]
  onSave: (features: CarFeature[]) => void
  onCancel: () => void
}

export function CarFeatureSelector({ initialFeatures = [], onSave, onCancel }: CarFeatureSelectorProps) {
  const [selectedFeatures, setSelectedFeatures] = useState<CarFeature[]>(initialFeatures)
  const [editingFeature, setEditingFeature] = useState<string | null>(null)
  const [newFeatureValue, setNewFeatureValue] = useState<string>('')

  const handleFeatureToggle = (category: string, featureId: string) => {
    const feature = AVAILABLE_FEATURES[category].find(f => f.id === featureId)
    if (!feature) return

    const existingIndex = selectedFeatures.findIndex(f => f.id === featureId)
    
    if (existingIndex >= 0) {
      // Remove feature
      setSelectedFeatures(prev => prev.filter(f => f.id !== featureId))
    } else {
      // Add feature with default value
      let defaultValue: string | number | boolean = ''
      
      if (feature.type === 'boolean') {
        defaultValue = true
      } else if (feature.type === 'number') {
        defaultValue = 0
      } else if (feature.type === 'select' && feature.options) {
        defaultValue = feature.options[0]
      }
      
      const newFeature: CarFeature = {
        id: featureId,
        value: defaultValue,
        label: feature.label,
        icon: feature.icon,
        type: feature.type,
        options: feature.options,
        placeholder: feature.placeholder,
        suffix: feature.suffix
      }
      
      setSelectedFeatures(prev => [...prev, newFeature])
    }
  }

  const handleValueChange = (featureId: string, newValue: string | number | boolean) => {
    setSelectedFeatures(prev => 
      prev.map(f => f.id === featureId ? { ...f, value: newValue } : f)
    )
  }

  const handleEditFeature = (featureId: string) => {
    const feature = selectedFeatures.find(f => f.id === featureId)
    if (feature) {
      setNewFeatureValue(String(feature.value))
      setEditingFeature(featureId)
    }
  }

  const handleSaveEdit = () => {
    if (editingFeature) {
      const feature = selectedFeatures.find(f => f.id === editingFeature)
      if (feature) {
        let processedValue: string | number | boolean = newFeatureValue
        
        if (feature.type === 'number') {
          processedValue = Number(newFeatureValue) || 0
        } else if (feature.type === 'boolean') {
          processedValue = newFeatureValue === 'true' || newFeatureValue === '1'
        }
        
        handleValueChange(editingFeature, processedValue)
      }
      setEditingFeature(null)
      setNewFeatureValue('')
    }
  }

  const handleCancelEdit = () => {
    setEditingFeature(null)
    setNewFeatureValue('')
  }

  const isFeatureSelected = (featureId: string) => {
    return selectedFeatures.some(f => f.id === featureId)
  }

  const renderFeatureValue = (feature: CarFeature) => {
    if (editingFeature === feature.id) {
      if (feature.type === 'select' && feature.options) {
        return (
          <select
            value={newFeatureValue}
            onChange={(e) => setNewFeatureValue(e.target.value)}
            className="px-2 py-1 border rounded text-sm"
          >
            {feature.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )
      } else if (feature.type === 'boolean') {
        return (
          <select
            value={newFeatureValue}
            onChange={(e) => setNewFeatureValue(e.target.value)}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        )
      } else {
        return (
          <Input
            value={newFeatureValue}
            onChange={(e) => setNewFeatureValue(e.target.value)}
            placeholder={feature.placeholder}
            className="text-sm"
            type={feature.type === 'number' ? 'number' : 'text'}
          />
        )
      }
    }

    if (feature.type === 'boolean') {
      return (
        <Badge variant={feature.value ? "default" : "secondary"}>
          {feature.value ? 'Yes' : 'No'}
        </Badge>
      )
    }

    return (
      <span className="text-sm text-gray-600">
        {feature.value}
        {feature.suffix && ` ${feature.suffix}`}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Car Features</h2>
          <p className="text-gray-600">Select and configure features for this car</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={() => onSave(selectedFeatures)}>
            <Save className="h-4 w-4 mr-2" />
            Save Features
          </Button>
        </div>
      </div>

      {/* Selected Features */}
      {selectedFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Features ({selectedFeatures.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedFeatures.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-sm">{feature.label}</div>
                        {renderFeatureValue(feature)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {editingFeature === feature.id ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => handleEditFeature(feature.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleFeatureToggle('basic', feature.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Features */}
      {Object.entries(AVAILABLE_FEATURES).map(([category, features]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="capitalize">{category} Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {features.map((feature) => {
                const Icon = feature.icon
                const isSelected = isFeatureSelected(feature.id)
                
                return (
                  <div
                    key={feature.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleFeatureToggle(category, feature.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                      <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                        {feature.label}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="mt-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
