import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs: FAQItem[] = [
    {
      category: 'Orders & Payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard), debit cards. All payments are processed via WhatsApp. For further details, please contact on WhatsApp.'
    },
    {
      category: 'Orders & Payment',
      question: 'Can I cancel my order?',
      answer: 'You can cancel your order within 1 hour of placing it. After that, your order enters processing and cannot be changed. Please contact on WhatsApp immediately if you need to make changes.'
    },
    {
      category: 'Shipping',
      question: 'How long does shipping take?',
      answer: 'Standard delivery takes 3-5 business days. A fast delivery option is available with an estimated delivery time of up to 2 business days. Delivery charges may vary based on weight and delivery location.'
    },
    {
      category: 'Shipping',
      question: 'Do you ship internationally?',
      answer: 'For international delieveries, please contact on WhatsApp.'
    },
    {
      category: 'Shipping',
      question: 'How can I track my order?',
      answer: 'Once your order ships, you\'ll receive a tracking number via WhatsApp. You can track your package through the carrier\'s website using the tracking link provided.'
    },
    {
      category: 'Returns & Exchanges',
      question: 'What is your return policy?',
      answer: 'We offer a 7-day return policy on most items. Items must be returned in their original and working condition, not damaged and with all accessories and packaging. Damaged, used, or non-original condition products are not eligible for return or refund. Refunds are processed after parcel inspection as per our policy for more details check our Returns & Exchanges page.'
    },
    {
      category: 'Returns & Exchanges',
      question: 'How do I return an item?',
      answer: 'See our Returns & Exchanges page for detailed instructions on how to initiate a return.'
    },
   
    {
      category: 'Products',
      question: 'Are your products authentic?',
      answer: 'Yes, all our products are 100% authentic and sourced directly from authorized distributors and manufacturers. We guarantee the authenticity of every item we sell.'
    },
    {
      category: 'Products',
      question: 'Do you restock sold-out items?',
      answer: 'We try to restock popular items as quickly as possible. You can contact us for more information.'
    },
   
    {
      category: 'Account',
      question: 'Do I need an account to make a purchase?',
      answer: 'Yes, you need an account to make a purchase.'
    },
    {
      category: 'Account',
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page. Enter your email address and we\'ll send you a password reset link. Follow the instructions in the email to create a new password. also check your spam/junk folder if you don\'t see the email in your inbox.'
    },
   
  ]

  const categories = Array.from(new Set(faqs.map(faq => faq.category)))

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-black text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="w-16 h-16" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-300 text-center">
            Find answers to common questions about Esfylo
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Categories */}
        {categories.map((category) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{category}</h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {faqs
                .filter(faq => faq.category === category)
                .map((faq) => {
                  const globalIndex = faqs.indexOf(faq)
                  const isOpen = openIndex === globalIndex
                  
                  return (
                    <div key={globalIndex} className="border-b border-gray-200 last:border-b-0">
                      <button
                        onClick={() => toggleFAQ(globalIndex)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                      >
                        <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        ))}

        {/* Contact Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Still Have Questions?</h3>
          <p className="text-gray-600 mb-6">
            Can't find the answer you're looking for? Our customer support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-block bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Contact Support
            </Link>
            <a
                 href="https://mail.google.com/mail/?view=cm&fs=1&to=only.esfylo.store@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-black border-2 border-black py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Email Us
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/shipping"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <h4 className="font-semibold text-gray-900 mb-2">Shipping Info</h4>
            <p className="text-sm text-gray-600">Learn about delivery times and costs</p>
          </Link>
          <Link
            to="/returns"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <h4 className="font-semibold text-gray-900 mb-2">Returns & Exchanges</h4>
            <p className="text-sm text-gray-600">7-day return policy details</p>
          </Link>
          <Link
            to="/about"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <h4 className="font-semibold text-gray-900 mb-2">About Us</h4>
            <p className="text-sm text-gray-600">Learn more about Esfylo</p>
          </Link>
        </div>

        {/* Back Link */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <Link 
            to="/" 
            className="inline-flex items-center text-black hover:underline font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FAQ
