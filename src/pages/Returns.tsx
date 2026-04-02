import React from 'react'
import { Link } from 'react-router-dom'
import { RotateCcw, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const Returns: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-black text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-4">
            <RotateCcw className="w-16 h-16" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Returns & Exchanges
          </h1>
          <p className="text-xl text-gray-300 text-center">
            We want you to love your purchase
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">

          {/* Return Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7-Day Return Policy</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We offer a 7-day return policy on most items. If you're not completely satisfied with your purchase, you can return it within 7 days of delivery for a refund or exchange. Refunds will only be issued for items returned in original and working condition as delivered, not damaged and will be processed after parcel inspection as per our policy.
            </p>
            <div className="bg-black text-white rounded-lg p-6">
              <p className="text-gray-300 text-sm">We'll contact you on WhatsApp for return instructions</p>
            </div>
          </section>

          {/* Eligible Items */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Eligible for Return</h2>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Items in original condition with tags (if provided) attached</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Undamaged, unworn, unwashed, and undamaged items</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Items in original packaging</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Items with all accessories and documentation (if provided)</span>
              </li>
            </ul>
          </section>

          {/* Non-Returnable Items */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">Non-Returnable Items</h2>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-red-600 mr-2">✗</span>
                <span>Damaged, used, or items not in their original condition (including missing accessories/packaging)</span>
              </li>

              <li className="flex items-start">
                <span className="text-red-600 mr-2">✗</span>
                <span>Final sale or clearance items</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">✗</span>
                <span>Digital products</span>
              </li>
              {/* <li className="flex items-start">
                <span className="text-red-600 mr-2">✗</span>
                <span>Custom or personalized items</span>
              </li> */}
            </ul>
          </section>

          {/* How to Return */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Return an Item</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Initiate Return</h3>
                  <p className="text-gray-600">Contact us on WhatsApp to initiate your return. Further instructions will be provided on whatsapp.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Print Label</h3>
                  <p className="text-gray-600">We'll contact you on WhatsApp with a prepaid return shipping label. Print it and attach it to your package.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Ship It Back</h3>
                  <p className="text-gray-600">We will guide you through the return process on WhatsApp.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Get Your Refund</h3>
                  <p className="text-gray-600">Once we receive and inspect your return, we'll process your refund within 5-7 business days.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Exchanges */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Exchanges</h2>
            <div className="text-gray-600 space-y-3">
              <p>
                Need a different color? We make exchanges easy:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Follow the same return process above</li>
                <li>Contact us on WhatsApp to initiate your exchange</li>
                <li>Choose your new item</li>
                <li>We'll ship your exchange as soon as we receive your return</li>
              </ul>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm">
                  <strong>Tip:</strong> For faster service, you can place a new order for the item you want and return the original item separately.
                </p>
              </div>
            </div>
          </section>

          {/* Refund Timeline */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-black" />
              <h2 className="text-2xl font-bold text-gray-900">Refund Timeline</h2>
            </div>
            <div className="text-gray-600 space-y-3">
              <p>
                Once we receive your return:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Inspection:</strong> 1-2 business days</li>
                <li><strong>Refund processing:</strong> 3-5 business days</li>
                <li><strong>Payment processing:</strong> 5-7 business days</li>
              </ul>
              <p className="mt-4">
                You'll receive a confirmation message on WhatsApp once your refund is processed.
              </p>
            </div>
          </section>

          {/* Damaged or Defective */}
          <section className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Received a Damaged or Defective Item?</h2>
            <p className="text-gray-700 mb-4">
              We're sorry! Please contact us immediately with photos of the damage. We'll send you a replacement or issue a full refund right away.
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> <a href="https://mail.google.com/mail/?view=cm&fs=1&to=only.esfylo.store@gmail.com" target="_blank" rel="noopener noreferrer" className="text-black hover:underline">only.esfylo.store@gmail.com</a></p>
              <p><strong>Phone:</strong> +92 318 5631518</p>
            </div>
          </section>

          {/* Back Link */}
          <div className="pt-8 border-t border-gray-200">
            <Link
              to="/"
              className="inline-flex items-center text-black hover:underline font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Returns
