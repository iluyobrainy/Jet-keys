"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  CreditCard,
  Save,
  Percent,
  Settings,
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react"
import { useEffect, useState } from "react"
import { checkoutService } from "@/lib/admin-services"

interface CheckoutConfig {
  vat_rate: number
  service_fee_rate: number
  insurance_fee: number
  delivery_fee: number
  late_return_fee: number
  cancellation_fee_rate: number
  minimum_rental_hours: number
  maximum_rental_days: number
  advance_booking_days: number
  payment_methods: string[]
  currency: string
  terms_and_conditions: string
  privacy_policy: string
  refund_policy: string
  contact_email: string
  contact_phone: string
  business_address: string
}

export default function CheckoutConfigPage() {
  const [config, setConfig] = useState<CheckoutConfig>({
    vat_rate: 7.5,
    service_fee_rate: 2.5,
    insurance_fee: 5000,
    delivery_fee: 10000,
    late_return_fee: 25000,
    cancellation_fee_rate: 10,
    minimum_rental_hours: 4,
    maximum_rental_days: 30,
    advance_booking_days: 7,
    payment_methods: ['card', 'bank_transfer', 'cash'],
    currency: 'NGN',
    terms_and_conditions: '',
    privacy_policy: '',
    refund_policy: '',
    contact_email: '',
    contact_phone: '',
    business_address: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await checkoutService.getCheckoutConfig()
        setConfig(data)
      } catch (error) {
        console.error('Error fetching checkout config:', error)
      }
    }

    fetchConfig()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setConfig(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  const handlePaymentMethodChange = (method: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      payment_methods: checked 
        ? [...prev.payment_methods, method]
        : prev.payment_methods.filter(m => m !== method)
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await checkoutService.updateCheckoutConfig(config)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving config:', error)
      alert('Failed to save configuration')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Checkout Configuration</h1>
            <p className="text-gray-600">Configure pricing, fees, and checkout settings</p>
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
                Save Configuration
              </>
            )}
          </Button>
        </div>

        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">Configuration saved successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pricing & Fees */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-xl font-bold mr-2">₦</span>
                Pricing & Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="vat_rate">VAT Rate (%)</Label>
                <Input
                  id="vat_rate"
                  name="vat_rate"
                  type="number"
                  value={config.vat_rate}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  max="100"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Current VAT rate in Nigeria: 7.5%
                </p>
              </div>

              <div>
                <Label htmlFor="service_fee_rate">Service Fee Rate (%)</Label>
                <Input
                  id="service_fee_rate"
                  name="service_fee_rate"
                  type="number"
                  value={config.service_fee_rate}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  max="100"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Additional service charge percentage
                </p>
              </div>

              <div>
                <Label htmlFor="insurance_fee">Insurance Fee (NGN)</Label>
                <Input
                  id="insurance_fee"
                  name="insurance_fee"
                  type="number"
                  value={config.insurance_fee}
                  onChange={handleInputChange}
                  min="0"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Mandatory insurance coverage fee
                </p>
              </div>

              <div>
                <Label htmlFor="delivery_fee">Delivery Fee (NGN)</Label>
                <Input
                  id="delivery_fee"
                  name="delivery_fee"
                  type="number"
                  value={config.delivery_fee}
                  onChange={handleInputChange}
                  min="0"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Vehicle delivery to customer location
                </p>
              </div>

              <div>
                <Label htmlFor="late_return_fee">Late Return Fee (NGN)</Label>
                <Input
                  id="late_return_fee"
                  name="late_return_fee"
                  type="number"
                  value={config.late_return_fee}
                  onChange={handleInputChange}
                  min="0"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Penalty for returning vehicle late
                </p>
              </div>

              <div>
                <Label htmlFor="cancellation_fee_rate">Cancellation Fee Rate (%)</Label>
                <Input
                  id="cancellation_fee_rate"
                  name="cancellation_fee_rate"
                  type="number"
                  value={config.cancellation_fee_rate}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  max="100"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Percentage of booking amount charged for cancellations
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Rental Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Rental Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="minimum_rental_hours">Minimum Rental Hours</Label>
                <Input
                  id="minimum_rental_hours"
                  name="minimum_rental_hours"
                  type="number"
                  value={config.minimum_rental_hours}
                  onChange={handleInputChange}
                  min="1"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Minimum rental duration in hours
                </p>
              </div>

              <div>
                <Label htmlFor="maximum_rental_days">Maximum Rental Days</Label>
                <Input
                  id="maximum_rental_days"
                  name="maximum_rental_days"
                  type="number"
                  value={config.maximum_rental_days}
                  onChange={handleInputChange}
                  min="1"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Maximum rental duration in days
                </p>
              </div>

              <div>
                <Label htmlFor="advance_booking_days">Advance Booking Days</Label>
                <Input
                  id="advance_booking_days"
                  name="advance_booking_days"
                  type="number"
                  value={config.advance_booking_days}
                  onChange={handleInputChange}
                  min="1"
                />
                <p className="text-sm text-gray-600 mt-1">
                  How many days in advance customers can book
                </p>
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  name="currency"
                  value={config.currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NGN">Nigerian Naira (NGN)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'card', label: 'Credit/Debit Card', description: 'Visa, Mastercard, etc.' },
                { value: 'bank_transfer', label: 'Bank Transfer', description: 'Direct bank transfer' },
                { value: 'cash', label: 'Cash Payment', description: 'Pay on delivery' },
                { value: 'mobile_money', label: 'Mobile Money', description: 'MTN, Airtel, etc.' },
                { value: 'crypto', label: 'Cryptocurrency', description: 'Bitcoin, Ethereum, etc.' },
                { value: 'installment', label: 'Installment Plan', description: 'Pay in installments' }
              ].map((method) => (
                <div key={method.value} className="flex items-center space-x-3 p-4 border rounded-lg">
                  <input
                    type="checkbox"
                    id={method.value}
                    checked={config.payment_methods.includes(method.value)}
                    onChange={(e) => handlePaymentMethodChange(method.value, e.target.checked)}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <Label htmlFor={method.value} className="font-medium">
                      {method.label}
                    </Label>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  value={config.contact_email}
                  onChange={handleInputChange}
                  placeholder="info@jetandkeys.com"
                />
              </div>
              <div>
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  type="tel"
                  value={config.contact_phone}
                  onChange={handleInputChange}
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="business_address">Business Address</Label>
              <Textarea
                id="business_address"
                name="business_address"
                value={config.business_address}
                onChange={handleInputChange}
                placeholder="Enter your business address..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Legal Documents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                name="terms_and_conditions"
                value={config.terms_and_conditions}
                onChange={handleInputChange}
                placeholder="Enter your terms and conditions..."
                rows={8}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                name="privacy_policy"
                value={config.privacy_policy}
                onChange={handleInputChange}
                placeholder="Enter your privacy policy..."
                rows={8}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Refund Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                name="refund_policy"
                value={config.refund_policy}
                onChange={handleInputChange}
                placeholder="Enter your refund policy..."
                rows={8}
              />
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold mb-4">Sample Booking Calculation</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Rental (1 day):</span>
                  <span>{formatCurrency(150000)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insurance Fee:</span>
                  <span>{formatCurrency(config.insurance_fee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>{formatCurrency(config.delivery_fee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee ({config.service_fee_rate}%):</span>
                  <span>{formatCurrency(150000 * config.service_fee_rate / 100)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(150000 + config.insurance_fee + config.delivery_fee + (150000 * config.service_fee_rate / 100))}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT ({config.vat_rate}%):</span>
                  <span>{formatCurrency((150000 + config.insurance_fee + config.delivery_fee + (150000 * config.service_fee_rate / 100)) * config.vat_rate / 100)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency((150000 + config.insurance_fee + config.delivery_fee + (150000 * config.service_fee_rate / 100)) * (1 + config.vat_rate / 100))}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

