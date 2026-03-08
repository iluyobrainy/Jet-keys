"use client"

import { MessageCircle, Send, Twitter, Phone, MapPin } from "lucide-react"

export function ContactInfo() {
  const contactSections = [
    {
      title: "Chat with us",
      description: "Speak to our friendly team via live chat.",
      options: [
        {
          icon: MessageCircle,
          text: "Start a live chat",
          action: "chat"
        },
        {
          icon: Send,
          text: "Shoot us an email",
          action: "email"
        },
        {
          icon: Twitter,
          text: "Message us on X",
          action: "twitter"
        }
      ]
    },
    {
      title: "Call us",
      description: "Call our team Mon-Fri from 8am to 5pm.",
      options: [
        {
          icon: Phone,
          text: "+234 (0) 800 000 0000",
          action: "call"
        }
      ]
    },
    {
      title: "Visit us",
      description: "Chat to us in person at our Lagos HQ.",
      options: [
        {
          icon: MapPin,
          text: "Victoria Island, Lagos, Nigeria",
          action: "location"
        }
      ]
    }
  ]

  const handleAction = (action: string, text: string) => {
    switch (action) {
      case "chat":
        console.log("Starting live chat...")
        break
      case "email":
        window.location.href = "mailto:info@jetandkeys.com"
        break
      case "twitter":
        window.open("https://twitter.com/jetandkeys", "_blank")
        break
      case "call":
        window.location.href = `tel:${text.replace(/\s/g, "")}`
        break
      case "location":
        window.open("https://maps.google.com/?q=Victoria+Island+Lagos+Nigeria", "_blank")
        break
      default:
        console.log(`Action: ${action}, Text: ${text}`)
    }
  }

  return (
    <div className="space-y-8">
      {contactSections.map((section, index) => (
        <div key={index} className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {section.title}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {section.description}
          </p>
          
          <div className="space-y-4">
            {section.options.map((option, optionIndex) => {
              const IconComponent = option.icon
              return (
                <button
                  key={optionIndex}
                  onClick={() => handleAction(option.action, option.text)}
                  className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-4 text-left text-gray-900 transition-colors duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-gray-500 transition-colors duration-200 group-hover:bg-blue-100 group-hover:text-blue-600">
                      <IconComponent className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-semibold underline underline-offset-4 decoration-1">
                      {option.text}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
