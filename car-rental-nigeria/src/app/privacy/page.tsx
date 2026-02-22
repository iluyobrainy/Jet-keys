"use client"

import { Navigation } from "@/components/navigation"
import { FooterSection } from "@/components/footer-section"
import { useBusinessInfo } from "@/lib/hooks/useBusinessInfo"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Eye, Lock, Database, Mail, Phone } from "lucide-react"

export default function PrivacyPage() {
  const { data: businessInfo, isLoading } = useBusinessInfo()

  const defaultPrivacy = `
1. INFORMATION WE COLLECT
We collect information you provide directly to us, such as when you create an account, make a reservation, or contact us for support.

Personal Information:
- Name and contact information (email, phone number)
- Driver's license information
- Payment information
- Rental preferences and history

2. HOW WE USE YOUR INFORMATION
We use the information we collect to:
- Process and manage your reservations
- Provide customer support
- Send important updates about your rental
- Improve our services
- Comply with legal obligations

3. INFORMATION SHARING
We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
- With service providers who assist in our operations
- When required by law or legal process
- To protect our rights and safety

4. DATA SECURITY
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

5. COOKIES AND TRACKING
We use cookies and similar technologies to enhance your experience on our website and analyze usage patterns.

6. YOUR RIGHTS
You have the right to:
- Access your personal information
- Correct inaccurate information
- Request deletion of your information
- Opt-out of marketing communications

7. DATA RETENTION
We retain your personal information for as long as necessary to provide our services and comply with legal obligations.

8. CHILDREN'S PRIVACY
Our services are not intended for children under 18. We do not knowingly collect personal information from children.

9. CHANGES TO THIS POLICY
We may update this privacy policy from time to time. We will notify you of any material changes.

10. CONTACT US
If you have questions about this privacy policy, please contact us using the information provided in our contact section.

Last updated: January 2025
`

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your privacy is important to us. Learn how we collect, use, and protect your personal information.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-blue-600" />
                  Privacy Policy
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
                      {businessInfo?.privacyPolicy || defaultPrivacy}
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
                  <Lock className="h-5 w-5 mr-2 text-green-500" />
                  Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Badge variant="outline" className="mt-0.5">Secure</Badge>
                  <span className="text-sm text-gray-600">Encrypted data transmission</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Badge variant="outline" className="mt-0.5">Limited</Badge>
                  <span className="text-sm text-gray-600">Minimal data collection</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Badge variant="outline" className="mt-0.5">Protected</Badge>
                  <span className="text-sm text-gray-600">Secure data storage</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Badge variant="outline" className="mt-0.5">Private</Badge>
                  <span className="text-sm text-gray-600">No data selling</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Database className="h-5 w-5 mr-2 text-blue-500" />
                  Your Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">Access</h4>
                  <p className="text-sm text-gray-600">View your personal data</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Correction</h4>
                  <p className="text-sm text-gray-600">Update inaccurate information</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Deletion</h4>
                  <p className="text-sm text-gray-600">Request data removal</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Opt-out</h4>
                  <p className="text-sm text-gray-600">Unsubscribe from marketing</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Mail className="h-5 w-5 mr-2 text-purple-500" />
                  Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{businessInfo?.contactEmail || 'privacy@jetandkeys.com'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{businessInfo?.contactPhone || '+234 123 456 7890'}</span>
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




