"use client"

import { Navigation } from "@/components/navigation"
import { FooterSection } from "@/components/footer-section"
import { useBusinessInfo } from "@/lib/hooks/useBusinessInfo"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Shield, AlertTriangle } from "lucide-react"

export default function TermsPage() {
  const { data: businessInfo, isLoading } = useBusinessInfo()

  const defaultTerms = `
1. RENTAL AGREEMENT
By renting a vehicle from Jet & Keys, you agree to these terms and conditions. This agreement constitutes a legally binding contract between you (the "Renter") and Jet & Keys (the "Company").

2. ELIGIBILITY REQUIREMENTS
- Must be at least 21 years old
- Valid driver's license required
- Credit card or valid payment method required
- International drivers must have valid international driving permit

3. RENTAL PERIOD AND FEES
- Rental period begins at the scheduled pickup time
- Late returns are subject to additional fees
- Minimum rental duration: 4 hours
- Maximum rental duration: 30 days
- Advance booking limit: 7 days

4. PAYMENT TERMS
- Full payment required at time of booking
- Security deposit may be required
- Additional fees for damages, late returns, or violations
- Refunds subject to cancellation policy

5. VEHICLE CONDITION AND DAMAGES
- Vehicle must be returned in same condition as received
- Renter responsible for all damages during rental period
- Pre-rental inspection required
- Report any damages immediately

6. INSURANCE AND LIABILITY
- Basic insurance included in rental price
- Renter responsible for deductible amount
- Additional coverage available for purchase
- Company not liable for personal belongings

7. PROHIBITED USES
- No smoking in vehicles
- No pets without prior approval
- No off-road driving
- No towing or hauling
- No commercial use without permission

8. CANCELLATION POLICY
- Free cancellation up to 24 hours before pickup
- Cancellation fees apply within 24 hours
- No refund for no-shows
- Refunds processed within 4 working days

9. TERMINATION OF RENTAL
- Company may terminate rental for violations
- Immediate return required upon termination
- No refund for terminated rentals
- Additional fees may apply

10. GOVERNING LAW
This agreement is governed by Nigerian law. Any disputes will be resolved in Nigerian courts.

Last updated: January 2025
`

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Terms & Conditions</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Please read these terms and conditions carefully before renting a vehicle from Jet & Keys.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Rental Terms & Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                      {businessInfo?.termsAndConditions || defaultTerms}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Badge variant="outline" className="mt-0.5">Min</Badge>
                  <span className="text-sm text-gray-600">4 hours minimum rental</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Badge variant="outline" className="mt-0.5">Max</Badge>
                  <span className="text-sm text-gray-600">30 days maximum rental</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Badge variant="outline" className="mt-0.5">Age</Badge>
                  <span className="text-sm text-gray-600">21+ years old required</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Badge variant="outline" className="mt-0.5">License</Badge>
                  <span className="text-sm text-gray-600">Valid driver's license</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="h-5 w-5 mr-2 text-green-500" />
                  Quick Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">Cancellation Policy</h4>
                  <p className="text-sm text-gray-600">Free cancellation up to 24 hours before pickup</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Refund Processing</h4>
                  <p className="text-sm text-gray-600">Refunds processed within 4 working days</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Late Return Fee</h4>
                  <p className="text-sm text-gray-600">Additional charges for late returns</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <FooterSection />
    </div>
  )
}




