"use client"

import { Navigation } from "@/components/navigation"
import { FooterSection } from "@/components/footer-section"
import { useBusinessInfo } from "@/lib/hooks/useBusinessInfo"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Clock, CreditCard, AlertCircle, CheckCircle } from "lucide-react"

export default function RefundPage() {
  const { data: businessInfo, isLoading } = useBusinessInfo()

  const defaultRefund = `
1. REFUND ELIGIBILITY
Refunds are available under the following circumstances:
- Cancellation made more than 24 hours before scheduled pickup
- Vehicle unavailable due to company fault
- Mechanical failure preventing safe operation
- Service not provided as promised

2. CANCELLATION POLICY
- Free cancellation: More than 24 hours before pickup
- Partial refund: 24 hours or less before pickup (subject to cancellation fee)
- No refund: No-show or cancellation after pickup time

3. REFUND PROCESS
- Refunds processed within 4 working days
- Original payment method will be credited
- Processing time may vary by payment provider
- Refund amount excludes any applicable fees

4. CANCELLATION FEES
- No fee: Cancellation 24+ hours before pickup
- 25% fee: Cancellation within 24 hours
- 50% fee: Cancellation within 2 hours
- No refund: No-show or after pickup

5. LATE RETURN FEES
- Additional charges apply for late returns
- Fee calculated per hour of delay
- Maximum late fee cap applies
- Fees deducted from security deposit

6. DAMAGE CHARGES
- Charges for damages beyond normal wear
- Pre-rental inspection documentation required
- Repair costs plus administrative fees
- Insurance claims may reduce charges

7. REFUND METHODS
- Credit card: Refunded to original card
- Bank transfer: Processed to provided account
- Cash payments: Bank transfer only
- Processing fees may apply

8. DISPUTE RESOLUTION
- Contact customer service for refund disputes
- Provide booking reference and reason
- Investigation process within 5 business days
- Resolution communicated via email/phone

9. SPECIAL CIRCUMSTANCES
- Weather-related cancellations: Full refund
- Medical emergencies: Case-by-case review
- Government restrictions: Full refund
- Force majeure events: Full refund

10. CONTACT INFORMATION
For refund inquiries, contact us using the information provided in our contact section.

Last updated: January 2025
`

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <RefreshCw className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Refund Policy</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn about our refund and cancellation policies, processing times, and how to request a refund.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                  Refund Policy
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
                      {businessInfo?.refundPolicy || defaultRefund}
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
                  <Clock className="h-5 w-5 mr-2 text-green-500" />
                  Processing Times
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Badge variant="outline" className="mt-0.5">Fast</Badge>
                  <span className="text-sm text-gray-600">4 working days</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Badge variant="outline" className="mt-0.5">Secure</Badge>
                  <span className="text-sm text-gray-600">Original payment method</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Badge variant="outline" className="mt-0.5">Tracked</Badge>
                  <span className="text-sm text-gray-600">Email notifications</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
                  Cancellation Fees
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">24+ hours</span>
                  <Badge variant="secondary">Free</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Within 24 hours</span>
                  <Badge variant="destructive">25%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Within 2 hours</span>
                  <Badge variant="destructive">50%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">No-show</span>
                  <Badge variant="destructive">No refund</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <CheckCircle className="h-5 w-5 mr-2 text-blue-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">Request Refund</h4>
                  <p className="text-sm text-gray-600">Contact customer service</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Check Status</h4>
                  <p className="text-sm text-gray-600">Track your refund online</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Dispute Charge</h4>
                  <p className="text-sm text-gray-600">File a dispute if needed</p>
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




