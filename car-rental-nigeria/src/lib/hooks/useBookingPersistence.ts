// lib/hooks/useBookingPersistence.ts
import { useState, useEffect } from 'react'

interface BookingFormData {
  pickupLocation: string
  dropoffLocation: string
  rentalMode: 'within_state' | 'interstate'
  serviceStateId: string
  originStateId: string
  destinationStateId: string
  zoneId: string
  areaId: string
  timingPackage: '12h' | '24h'
  pickupAddress: string
  dropoffAddress: string
  areaOfUse: string
  tripType: string
  pickupDate: Date | undefined
  dropoffDate: Date | undefined
  pickupTime: string | null
  dropoffTime: string | null
}

const STORAGE_KEY = 'jet-keys-booking-form'

export function useBookingPersistence(carId: string) {
  const [formData, setFormData] = useState<BookingFormData>({
    pickupLocation: '',
    dropoffLocation: '',
    rentalMode: 'within_state',
    serviceStateId: '',
    originStateId: '',
    destinationStateId: '',
    zoneId: '',
    areaId: '',
    timingPackage: '24h',
    pickupAddress: '',
    dropoffAddress: '',
    areaOfUse: '',
    tripType: 'drop_off',
    pickupDate: undefined,
    dropoffDate: undefined,
    pickupTime: '10:00',
    dropoffTime: '10:00'
  })

  // Load saved data on component mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(`${STORAGE_KEY}-${carId}`)
      if (savedData) {
        const parsed = JSON.parse(savedData)
        // Convert date strings back to Date objects
        const restoredData = {
          pickupLocation: '',
          dropoffLocation: '',
          rentalMode: 'within_state',
          serviceStateId: '',
          originStateId: '',
          destinationStateId: '',
          zoneId: '',
          areaId: '',
          timingPackage: '24h',
          pickupAddress: '',
          dropoffAddress: '',
          areaOfUse: '',
          tripType: 'drop_off',
          pickupTime: '10:00',
          dropoffTime: '10:00',
          ...parsed,
          pickupDate: parsed.pickupDate ? new Date(parsed.pickupDate) : undefined,
          dropoffDate: parsed.dropoffDate ? new Date(parsed.dropoffDate) : undefined
        } as BookingFormData
        setFormData(restoredData)
        console.log('📱 Restored booking form data:', restoredData)
      }
    } catch (error) {
      console.warn('Failed to restore booking form data:', error)
    }
  }, [carId])

  // Save data whenever form data changes
  useEffect(() => {
    try {
      const dataToSave = {
        ...formData,
        // Convert dates to strings for storage
        pickupDate: formData.pickupDate?.toISOString(),
        dropoffDate: formData.dropoffDate?.toISOString()
      }
      localStorage.setItem(`${STORAGE_KEY}-${carId}`, JSON.stringify(dataToSave))
      console.log('💾 Saved booking form data:', dataToSave)
    } catch (error) {
      console.warn('Failed to save booking form data:', error)
    }
  }, [formData, carId])

  // Update individual fields
  const updateField = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Clear saved data (useful after successful booking)
  const clearSavedData = () => {
    try {
      localStorage.removeItem(`${STORAGE_KEY}-${carId}`)
      setFormData({
        pickupLocation: '',
        dropoffLocation: '',
        rentalMode: 'within_state',
        serviceStateId: '',
        originStateId: '',
        destinationStateId: '',
        zoneId: '',
        areaId: '',
        timingPackage: '24h',
        pickupAddress: '',
        dropoffAddress: '',
        areaOfUse: '',
        tripType: 'drop_off',
        pickupDate: undefined,
        dropoffDate: undefined,
        pickupTime: '10:00',
        dropoffTime: '10:00'
      })
      console.log('🗑️ Cleared booking form data')
    } catch (error) {
      console.warn('Failed to clear booking form data:', error)
    }
  }

  // Check if form has any data
  const hasData = () => {
    return formData.pickupLocation || 
           formData.dropoffLocation || 
           formData.serviceStateId ||
           formData.originStateId ||
           formData.pickupAddress ||
           formData.pickupDate || 
           formData.dropoffDate
  }

  return {
    formData,
    updateField,
    clearSavedData,
    hasData: hasData()
  }
}




