"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
    services: [] as string[]
  })

  const services = [
    "Cars",
    "Jet"
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleServiceChange = (service: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      services: checked 
        ? [...prev.services, service]
        : prev.services.filter(s => s !== service)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Handle form submission here
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium text-gray-900">
              First name
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="First name"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium text-gray-900">
              Last name
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Last name"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-900">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Phone Number Field */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-900">
            Phone number
          </Label>
          <div className="flex gap-2">
            <Select defaultValue="NG">
              <SelectTrigger className="w-32 border border-gray-300 rounded-lg px-3 py-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NG">🇳🇬 Nigeria</SelectItem>
                <SelectItem value="US">🇺🇸 United States</SelectItem>
                <SelectItem value="UK">🇬🇧 United Kingdom</SelectItem>
                <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                <SelectItem value="GH">🇬🇭 Ghana</SelectItem>
                <SelectItem value="KE">🇰🇪 Kenya</SelectItem>
                <SelectItem value="ZA">🇿🇦 South Africa</SelectItem>
                <SelectItem value="EG">🇪🇬 Egypt</SelectItem>
                <SelectItem value="MA">🇲🇦 Morocco</SelectItem>
                <SelectItem value="TN">🇹🇳 Tunisia</SelectItem>
                <SelectItem value="DZ">🇩🇿 Algeria</SelectItem>
                <SelectItem value="LY">🇱🇾 Libya</SelectItem>
                <SelectItem value="SD">🇸🇩 Sudan</SelectItem>
                <SelectItem value="ET">🇪🇹 Ethiopia</SelectItem>
                <SelectItem value="UG">🇺🇬 Uganda</SelectItem>
                <SelectItem value="TZ">🇹🇿 Tanzania</SelectItem>
                <SelectItem value="RW">🇷🇼 Rwanda</SelectItem>
                <SelectItem value="BW">🇧🇼 Botswana</SelectItem>
                <SelectItem value="ZM">🇿🇲 Zambia</SelectItem>
                <SelectItem value="ZW">🇿🇼 Zimbabwe</SelectItem>
                <SelectItem value="MW">🇲🇼 Malawi</SelectItem>
                <SelectItem value="MZ">🇲🇿 Mozambique</SelectItem>
                <SelectItem value="AO">🇦🇴 Angola</SelectItem>
                <SelectItem value="CM">🇨🇲 Cameroon</SelectItem>
                <SelectItem value="CI">🇨🇮 Côte d'Ivoire</SelectItem>
                <SelectItem value="SN">🇸🇳 Senegal</SelectItem>
                <SelectItem value="ML">🇲🇱 Mali</SelectItem>
                <SelectItem value="BF">🇧🇫 Burkina Faso</SelectItem>
                <SelectItem value="NE">🇳🇪 Niger</SelectItem>
                <SelectItem value="TD">🇹🇩 Chad</SelectItem>
                <SelectItem value="CF">🇨🇫 Central African Republic</SelectItem>
                <SelectItem value="GA">🇬🇦 Gabon</SelectItem>
                <SelectItem value="CG">🇨🇬 Republic of the Congo</SelectItem>
                <SelectItem value="CD">🇨🇩 Democratic Republic of the Congo</SelectItem>
                <SelectItem value="BI">🇧🇮 Burundi</SelectItem>
                <SelectItem value="SS">🇸🇸 South Sudan</SelectItem>
                <SelectItem value="ER">🇪🇷 Eritrea</SelectItem>
                <SelectItem value="DJ">🇩🇯 Djibouti</SelectItem>
                <SelectItem value="SO">🇸🇴 Somalia</SelectItem>
                <SelectItem value="MG">🇲🇬 Madagascar</SelectItem>
                <SelectItem value="MU">🇲🇺 Mauritius</SelectItem>
                <SelectItem value="SC">🇸🇨 Seychelles</SelectItem>
                <SelectItem value="KM">🇰🇲 Comoros</SelectItem>
                <SelectItem value="CV">🇨🇻 Cape Verde</SelectItem>
                <SelectItem value="ST">🇸🇹 São Tomé and Príncipe</SelectItem>
                <SelectItem value="GQ">🇬🇶 Equatorial Guinea</SelectItem>
                <SelectItem value="GM">🇬🇲 Gambia</SelectItem>
                <SelectItem value="GN">🇬🇳 Guinea</SelectItem>
                <SelectItem value="GW">🇬🇼 Guinea-Bissau</SelectItem>
                <SelectItem value="SL">🇸🇱 Sierra Leone</SelectItem>
                <SelectItem value="LR">🇱🇷 Liberia</SelectItem>
                <SelectItem value="TG">🇹🇬 Togo</SelectItem>
                <SelectItem value="BJ">🇧🇯 Benin</SelectItem>
                <SelectItem value="DE">🇩🇪 Germany</SelectItem>
                <SelectItem value="FR">🇫🇷 France</SelectItem>
                <SelectItem value="IT">🇮🇹 Italy</SelectItem>
                <SelectItem value="ES">🇪🇸 Spain</SelectItem>
                <SelectItem value="NL">🇳🇱 Netherlands</SelectItem>
                <SelectItem value="BE">🇧🇪 Belgium</SelectItem>
                <SelectItem value="CH">🇨🇭 Switzerland</SelectItem>
                <SelectItem value="AT">🇦🇹 Austria</SelectItem>
                <SelectItem value="SE">🇸🇪 Sweden</SelectItem>
                <SelectItem value="NO">🇳🇴 Norway</SelectItem>
                <SelectItem value="DK">🇩🇰 Denmark</SelectItem>
                <SelectItem value="FI">🇫🇮 Finland</SelectItem>
                <SelectItem value="PL">🇵🇱 Poland</SelectItem>
                <SelectItem value="CZ">🇨🇿 Czech Republic</SelectItem>
                <SelectItem value="HU">🇭🇺 Hungary</SelectItem>
                <SelectItem value="RO">🇷🇴 Romania</SelectItem>
                <SelectItem value="BG">🇧🇬 Bulgaria</SelectItem>
                <SelectItem value="GR">🇬🇷 Greece</SelectItem>
                <SelectItem value="PT">🇵🇹 Portugal</SelectItem>
                <SelectItem value="IE">🇮🇪 Ireland</SelectItem>
                <SelectItem value="IS">🇮🇸 Iceland</SelectItem>
                <SelectItem value="LU">🇱🇺 Luxembourg</SelectItem>
                <SelectItem value="MT">🇲🇹 Malta</SelectItem>
                <SelectItem value="CY">🇨🇾 Cyprus</SelectItem>
                <SelectItem value="EE">🇪🇪 Estonia</SelectItem>
                <SelectItem value="LV">🇱🇻 Latvia</SelectItem>
                <SelectItem value="LT">🇱🇹 Lithuania</SelectItem>
                <SelectItem value="SK">🇸🇰 Slovakia</SelectItem>
                <SelectItem value="SI">🇸🇮 Slovenia</SelectItem>
                <SelectItem value="HR">🇭🇷 Croatia</SelectItem>
                <SelectItem value="RS">🇷🇸 Serbia</SelectItem>
                <SelectItem value="BA">🇧🇦 Bosnia and Herzegovina</SelectItem>
                <SelectItem value="ME">🇲🇪 Montenegro</SelectItem>
                <SelectItem value="MK">🇲🇰 North Macedonia</SelectItem>
                <SelectItem value="AL">🇦🇱 Albania</SelectItem>
                <SelectItem value="XK">🇽🇰 Kosovo</SelectItem>
                <SelectItem value="MD">🇲🇩 Moldova</SelectItem>
                <SelectItem value="UA">🇺🇦 Ukraine</SelectItem>
                <SelectItem value="BY">🇧🇾 Belarus</SelectItem>
                <SelectItem value="RU">🇷🇺 Russia</SelectItem>
                <SelectItem value="TR">🇹🇷 Turkey</SelectItem>
                <SelectItem value="IL">🇮🇱 Israel</SelectItem>
                <SelectItem value="PS">🇵🇸 Palestine</SelectItem>
                <SelectItem value="JO">🇯🇴 Jordan</SelectItem>
                <SelectItem value="LB">🇱🇧 Lebanon</SelectItem>
                <SelectItem value="SY">🇸🇾 Syria</SelectItem>
                <SelectItem value="IQ">🇮🇶 Iraq</SelectItem>
                <SelectItem value="IR">🇮🇷 Iran</SelectItem>
                <SelectItem value="SA">🇸🇦 Saudi Arabia</SelectItem>
                <SelectItem value="AE">🇦🇪 United Arab Emirates</SelectItem>
                <SelectItem value="QA">🇶🇦 Qatar</SelectItem>
                <SelectItem value="BH">🇧🇭 Bahrain</SelectItem>
                <SelectItem value="KW">🇰🇼 Kuwait</SelectItem>
                <SelectItem value="OM">🇴🇲 Oman</SelectItem>
                <SelectItem value="YE">🇾🇪 Yemen</SelectItem>
                <SelectItem value="AF">🇦🇫 Afghanistan</SelectItem>
                <SelectItem value="PK">🇵🇰 Pakistan</SelectItem>
                <SelectItem value="IN">🇮🇳 India</SelectItem>
                <SelectItem value="BD">🇧🇩 Bangladesh</SelectItem>
                <SelectItem value="LK">🇱🇰 Sri Lanka</SelectItem>
                <SelectItem value="MV">🇲🇻 Maldives</SelectItem>
                <SelectItem value="NP">🇳🇵 Nepal</SelectItem>
                <SelectItem value="BT">🇧🇹 Bhutan</SelectItem>
                <SelectItem value="MM">🇲🇲 Myanmar</SelectItem>
                <SelectItem value="TH">🇹🇭 Thailand</SelectItem>
                <SelectItem value="LA">🇱🇦 Laos</SelectItem>
                <SelectItem value="KH">🇰🇭 Cambodia</SelectItem>
                <SelectItem value="VN">🇻🇳 Vietnam</SelectItem>
                <SelectItem value="MY">🇲🇾 Malaysia</SelectItem>
                <SelectItem value="SG">🇸🇬 Singapore</SelectItem>
                <SelectItem value="BN">🇧🇳 Brunei</SelectItem>
                <SelectItem value="ID">🇮🇩 Indonesia</SelectItem>
                <SelectItem value="PH">🇵🇭 Philippines</SelectItem>
                <SelectItem value="TL">🇹🇱 Timor-Leste</SelectItem>
                <SelectItem value="CN">🇨🇳 China</SelectItem>
                <SelectItem value="TW">🇹🇼 Taiwan</SelectItem>
                <SelectItem value="HK">🇭🇰 Hong Kong</SelectItem>
                <SelectItem value="MO">🇲🇴 Macau</SelectItem>
                <SelectItem value="MN">🇲🇳 Mongolia</SelectItem>
                <SelectItem value="KP">🇰🇵 North Korea</SelectItem>
                <SelectItem value="KR">🇰🇷 South Korea</SelectItem>
                <SelectItem value="JP">🇯🇵 Japan</SelectItem>
                <SelectItem value="AU">🇦🇺 Australia</SelectItem>
                <SelectItem value="NZ">🇳🇿 New Zealand</SelectItem>
                <SelectItem value="FJ">🇫🇯 Fiji</SelectItem>
                <SelectItem value="PG">🇵🇬 Papua New Guinea</SelectItem>
                <SelectItem value="SB">🇸🇧 Solomon Islands</SelectItem>
                <SelectItem value="VU">🇻🇺 Vanuatu</SelectItem>
                <SelectItem value="NC">🇳🇨 New Caledonia</SelectItem>
                <SelectItem value="PF">🇵🇫 French Polynesia</SelectItem>
                <SelectItem value="WS">🇼🇸 Samoa</SelectItem>
                <SelectItem value="TO">🇹🇴 Tonga</SelectItem>
                <SelectItem value="KI">🇰🇮 Kiribati</SelectItem>
                <SelectItem value="TV">🇹🇻 Tuvalu</SelectItem>
                <SelectItem value="NR">🇳🇷 Nauru</SelectItem>
                <SelectItem value="PW">🇵🇼 Palau</SelectItem>
                <SelectItem value="FM">🇫🇲 Micronesia</SelectItem>
                <SelectItem value="MH">🇲🇭 Marshall Islands</SelectItem>
                <SelectItem value="BR">🇧🇷 Brazil</SelectItem>
                <SelectItem value="AR">🇦🇷 Argentina</SelectItem>
                <SelectItem value="CL">🇨🇱 Chile</SelectItem>
                <SelectItem value="UY">🇺🇾 Uruguay</SelectItem>
                <SelectItem value="PY">🇵🇾 Paraguay</SelectItem>
                <SelectItem value="BO">🇧🇴 Bolivia</SelectItem>
                <SelectItem value="PE">🇵🇪 Peru</SelectItem>
                <SelectItem value="EC">🇪🇨 Ecuador</SelectItem>
                <SelectItem value="CO">🇨🇴 Colombia</SelectItem>
                <SelectItem value="VE">🇻🇪 Venezuela</SelectItem>
                <SelectItem value="GY">🇬🇾 Guyana</SelectItem>
                <SelectItem value="SR">🇸🇷 Suriname</SelectItem>
                <SelectItem value="GF">🇬🇫 French Guiana</SelectItem>
                <SelectItem value="MX">🇲🇽 Mexico</SelectItem>
                <SelectItem value="GT">🇬🇹 Guatemala</SelectItem>
                <SelectItem value="BZ">🇧🇿 Belize</SelectItem>
                <SelectItem value="SV">🇸🇻 El Salvador</SelectItem>
                <SelectItem value="HN">🇭🇳 Honduras</SelectItem>
                <SelectItem value="NI">🇳🇮 Nicaragua</SelectItem>
                <SelectItem value="CR">🇨🇷 Costa Rica</SelectItem>
                <SelectItem value="PA">🇵🇦 Panama</SelectItem>
                <SelectItem value="CU">🇨🇺 Cuba</SelectItem>
                <SelectItem value="JM">🇯🇲 Jamaica</SelectItem>
                <SelectItem value="HT">🇭🇹 Haiti</SelectItem>
                <SelectItem value="DO">🇩🇴 Dominican Republic</SelectItem>
                <SelectItem value="PR">🇵🇷 Puerto Rico</SelectItem>
                <SelectItem value="TT">🇹🇹 Trinidad and Tobago</SelectItem>
                <SelectItem value="BB">🇧🇧 Barbados</SelectItem>
                <SelectItem value="AG">🇦🇬 Antigua and Barbuda</SelectItem>
                <SelectItem value="DM">🇩🇲 Dominica</SelectItem>
                <SelectItem value="GD">🇬🇩 Grenada</SelectItem>
                <SelectItem value="KN">🇰🇳 Saint Kitts and Nevis</SelectItem>
                <SelectItem value="LC">🇱🇨 Saint Lucia</SelectItem>
                <SelectItem value="VC">🇻🇨 Saint Vincent and the Grenadines</SelectItem>
              </SelectContent>
            </Select>
            <Input
              id="phone"
              type="tel"
              placeholder="+234 (0) 800 000 0000"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Message Field */}
        <div className="space-y-2">
          <Label htmlFor="message" className="text-sm font-medium text-gray-900">
            Message
          </Label>
          <Textarea
            id="message"
            placeholder="Leave us a message..."
            value={formData.message}
            onChange={(e) => handleInputChange("message", e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
            required
          />
        </div>

        {/* Services Checkboxes */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-900">
            Services
          </Label>
          <div className="flex space-x-6">
            {services.map((service) => (
              <div key={service} className="flex items-center space-x-3">
                <Checkbox
                  id={service}
                  checked={formData.services.includes(service)}
                  onCheckedChange={(checked) => handleServiceChange(service, checked as boolean)}
                  className="rounded border-gray-300"
                />
                <Label 
                  htmlFor={service}
                  className="text-sm text-gray-900 cursor-pointer"
                >
                  {service}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-black text-white hover:bg-gray-800 py-6 text-lg font-semibold transition-colors duration-200"
          style={{ borderRadius: '15px' }}
        >
          Send message
        </Button>
      </form>
    </div>
  )
}
