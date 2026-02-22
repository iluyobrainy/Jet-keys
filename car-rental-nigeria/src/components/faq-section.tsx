"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"

interface FAQItem {
  id: string
  question: string
  answer: string
  isExpanded: boolean
}

export function FAQSection() {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([
    {
      id: "car-prices",
      question: "How much average of car prices that you sell?",
      answer: "You can buy a Tesla for anywhere between $46,990 to $100,000. The Model 3 is the most affordable Tesla, followed by the Model Y.",
      isExpanded: true
    },
    {
      id: "drive-away",
      question: "When can I drive away in my new car after I pay it?",
      answer: "You can drive away in your new car immediately after completing the payment and documentation process. We ensure a seamless handover experience with all necessary paperwork completed on the spot.",
      isExpanded: false
    },
    {
      id: "financing-options",
      question: "How many financing options do you offer?",
      answer: "We offer multiple financing options including cash payment, bank transfer, credit card, and installment plans. We also partner with leading financial institutions to provide competitive loan options with flexible terms.",
      isExpanded: false
    },
    {
      id: "down-payment",
      question: "What happens if I don't have a down payment?",
      answer: "We understand that not everyone has a down payment ready. We offer various options including zero-down payment plans, trade-in opportunities, and flexible payment arrangements to make car ownership accessible to everyone.",
      isExpanded: false
    }
  ])

  const toggleFAQ = (id: string) => {
    setFaqItems(prevItems =>
      prevItems.map(item =>
        item.id === id
          ? { ...item, isExpanded: !item.isExpanded }
          : item
      )
    )
  }

  return (
    <section className="bg-gray-50 py-8 sm:py-12 lg:py-16" aria-label="Frequently Asked Questions">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-6">
              Let me know anything before you try
            </h2>
            <div className="border-t border-gray-200 mb-8"></div>
          </div>

          {/* FAQ Items */}
          <div className="space-y-0">
            {faqItems.map((item, index) => (
              <div
                key={item.id}
                className={`py-6 ${
                  index !== faqItems.length - 1 ? "border-b border-gray-200" : ""
                }`}
              >
                                 <button
                   onClick={() => toggleFAQ(item.id)}
                   className="w-full text-left relative pr-12 focus:outline-none rounded-lg"
                   aria-expanded={item.isExpanded}
                   aria-controls={`faq-answer-${item.id}`}
                 >
                  <h3 className="text-lg sm:text-xl lg:text-xl font-semibold text-black mb-3">
                    {item.question}
                  </h3>
                  
                  {/* Icon */}
                  <div className="absolute right-0 top-6 w-6 h-6 border border-black rounded-full flex items-center justify-center">
                    {item.isExpanded ? (
                      <Minus className="w-4 h-4 text-black" />
                    ) : (
                      <Plus className="w-4 h-4 text-black" />
                    )}
                  </div>
                </button>

                {/* Answer */}
                {item.isExpanded && (
                  <div
                    id={`faq-answer-${item.id}`}
                    className="mt-3 text-sm sm:text-base lg:text-base text-gray-600 leading-relaxed"
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
