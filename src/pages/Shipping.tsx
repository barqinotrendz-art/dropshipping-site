import React from 'react'
import { Link } from 'react-router-dom'
import { Truck, Package, Clock } from 'lucide-react'

const Shipping: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-black text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-4">
            <Truck className="w-16 h-16" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Shipping Information
          </h1>
          <p className="text-xl text-gray-300 text-center">
            Fast, reliable shipping to your doorstep
          </p>
          <p className="mt-3 text-center text-gray-200">
            Delivery within 3 to 5 business days. Charges may vary based on weight and location.
          </p>
          <p className='mt-3 text-center text-gray-200'>
            For any purchase, shipping charges are paid in advance and shared via WhatsApp.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">

          {/* Shipping Methods */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <Package className="w-6 h-6 text-black" />
              <h2 className="text-2xl font-bold text-gray-900">Shipping Methods</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900">Standard Shipping</h3>
                  <span className="text-black font-semibold">Charges vary by weight and delivery location</span>
                </div>
                <p className="text-gray-600 mb-2">Delivery in 3-5 business days</p>
                <p className="text-sm text-gray-500">Available for all domestic orders</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900">Fast Delivery</h3>
                  <span className="text-black font-semibold">Charges vary by weight and delivery location</span>
                </div>
                <p className="text-gray-600 mb-2">Estimated delivery up to 2 business days</p>
                <p className="text-sm text-gray-500">Available with advance payment only</p>
              </div>
           
            </div>
          </section>

          {/* Delivery Times */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <Clock className="w-6 h-6 text-black" />
              <h2 className="text-2xl font-bold text-gray-900">Estimated Delivery Times</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-900">Region</th>
                    <th className="px-4 py-3 font-semibold text-gray-900">Standard</th>
                    <th className="px-4 py-3 font-semibold text-gray-900">Fast Delivery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-gray-700">Pakistan</td>
                    <td className="px-4 py-3 text-gray-600">3-5 days (advance payment)</td>
                    <td className="px-4 py-3 text-gray-600">Up to 2 days (advance payment)</td>
                  </tr>

                </tbody>
              </table>
            </div>
            <p>
              Note: Delivery charges may vary depending on weight and location.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              * Delivery times are estimates and may vary based on location and processing conditions.
            </p>
          </section>




          {/* Order Processing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Processing</h2>
            <div className="text-gray-600 space-y-3">
              <p>
                We’ll update your order status to Processing as soon as we receive your shipping charges screenshot on WhatsApp!            
                  </p>
              <p>
                Orders are typically processed within 1-2 business days. You will receive a confirmation message via whatsapp when your order ships, including tracking information.
              </p>
              <p>
                {/* <strong>Processing times:</strong> */}
              </p>
              {/* <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Standard orders: 1-2 business days</li>
                <li>Custom/personalized items: 3-5 business days</li>
                <li>Pre-orders: Ships on specified release date</li>
              </ul> */}
            </div>
          </section>

          {/* Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Tracking</h2>
            <div className="text-gray-600 space-y-3">
              <p>
                Once your order ships, you'll receive a tracking number via whatsapp. You can track your package:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Using the tracking link in your shipping confirmation message on WhatsApp</li>
                <li>Using the tracking link directly on the carrier's website</li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
            <p className="text-gray-600 mb-4">
              If you have questions about shipping or need to track your order, please contact us on whatsapp:
            </p>
            <div className="space-y-2 text-gray-600">
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

export default Shipping
