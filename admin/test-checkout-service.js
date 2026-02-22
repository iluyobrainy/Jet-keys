// Test script to verify checkout service
import { checkoutService } from './src/lib/admin-services'

async function testCheckoutService() {
  try {
    console.log('Testing checkout service...')
    
    // Test getting config
    const config = await checkoutService.getCheckoutConfig()
    console.log('Current config:', config)
    
    // Test updating config
    const updatedConfig = {
      ...config,
      delivery_fee: 25000,
      vat_rate: 10,
      service_fee_rate: 5
    }
    
    const result = await checkoutService.updateCheckoutConfig(updatedConfig)
    console.log('Update result:', result)
    
    console.log('✅ Checkout service test passed!')
  } catch (error) {
    console.error('❌ Checkout service test failed:', error)
  }
}

testCheckoutService()




