import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/apiService'

export function useBusinessInfo() {
  return useQuery({
    queryKey: ['businessInfo'],
    queryFn: async () => {
      const settings = await apiService.getCheckoutSettings()
      return {
        contactEmail: settings.contact_email || 'info@jetandkeys.com',
        contactPhone: settings.contact_phone || '+234 123 456 7890',
        businessAddress: settings.business_address || 'Lagos, Nigeria',
        termsAndConditions: settings.terms_and_conditions,
        privacyPolicy: settings.privacy_policy,
        refundPolicy: settings.refund_policy
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false
  })
}




