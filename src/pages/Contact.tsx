import React from 'react'
import { Mail, Clock, MessageCircle, ArrowRight } from 'lucide-react'
import { useSocialSettings } from '../hooks/useSocialSettings'

const Contact: React.FC = () => {
  const { data: socialSettings } = useSocialSettings()
  const whatsappNumber = socialSettings?.whatsapp
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : undefined
  const canChat = Boolean(whatsappLink)

  return (
    <div className=" flex min-h-screen bg-gray-50 justify-center items-center flex-col">
      {/* Hero Section */}
      <section className="bg-black mt-12 text-white py-8 px-6 w-full md:w-10/12">
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Contact Us
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Need help quickly? Reach out via WhatsApp for fast support, or send us an email if you prefer detailed communication.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        {/* WhatsApp Contact */}
        <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 md:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">WhatsApp</h2>
              <p className="text-sm text-gray-500">Fastest way to reach us</p>
            </div>
          </div>

          <p>WhatsApp is our main contact method for fast and reliable support.</p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Message our support team directly on WhatsApp for instant help with orders, sizing, or product questions. 
            We usually reply within minutes during business hours.
          </p>

          <a
            href={whatsappLink}
            target={canChat ? '_blank' : undefined}
            rel={canChat ? 'noopener noreferrer' : undefined}
            className={`group inline-flex items-center justify-center gap-2 w-full bg-green-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 ${
              canChat
                ? 'hover:bg-green-600 hover:scale-[1.02]'
                : 'opacity-60 cursor-not-allowed'
            }`}
            aria-disabled={!canChat}
          >
            {canChat ? (
              <>
                Start WhatsApp Chat
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            ) : (
              'WhatsApp number unavailable'
            )}
          </a>

          <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Available 24/7</span>
          </div>

          {whatsappNumber && (
            <p className="mt-4 text-sm text-gray-500 text-center">
              Message us directly at <span className="font-medium">+{whatsappNumber}</span>
            </p>
          )}
        </div>

        {/* Email Contact */}
        <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 md:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Email</h2>
              <p className="text-sm text-gray-500">Best for detailed inquiries or if you not find us on whatsapp</p>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed mb-6">
            Prefer email? Send us a detailed message — we typically respond within 24 hours on business days.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-black transition-colors">
            <p className="text-xs uppercase text-gray-500 tracking-wide mb-1">Email us at</p>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=only.esfylo.store@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-gray-900 hover:underline"
            >
              only.esfylo.store@gmail.com
            </a>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Include your order number (if applicable) for faster support.
          </p>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center hover:shadow-2xl transition-all duration-300">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Looking for Quick Answers?</h3>
          <p className="text-gray-600 mb-6">
            Visit our FAQ page for answers to the most common questions.
          </p>
          <a
            href="/faq"
            className="inline-block bg-black text-white py-3 px-8 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200"
          >
            Visit FAQ
          </a>
        </div>
      </section>
    </div>
  )
}

export default Contact
