import React from 'react'
import { Link } from 'react-router-dom'
import { FileText, AlertCircle, ShoppingBag, CreditCard, Shield } from 'lucide-react'

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-black text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-16 h-16" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-300 text-center">
            Last updated: January 2024
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          
          {/* Introduction */}
          <section>
            <p className="text-gray-600 leading-relaxed">
              Welcome to Esfylo. By accessing or using our website and services, you agree to be bound by these Terms of Service. Please read them carefully before making any purchase or using our services.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <div className="text-gray-600 space-y-3">
              <p>
                By accessing and using Esfylo's website, you accept and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.
              </p>
              <p>
                We reserve the right to modify these terms at any time. Your continued use of the website after changes are posted constitutes your acceptance of the modified terms.
              </p>
            </div>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Account Registration</h2>
            <div className="text-gray-600 space-y-3">
              <p>To make purchases, you may need to create an account. You agree to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>

            </div>
          </section>

          {/* Products and Pricing */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <ShoppingBag className="w-6 h-6 text-black" />
              <h2 className="text-2xl font-bold text-gray-900">3. Products and Pricing</h2>
            </div>
            <div className="text-gray-600 space-y-3">
              <p>
                We strive to display accurate product information and pricing. However:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>We do not guarantee that product descriptions are error-free</li>
                <li>Prices are subject to change without notice</li>
                <li>We reserve the right to limit quantities</li>
                <li>We reserve the right to refuse or cancel any order</li>
              </ul>
              <p className="mt-3">
                If a product is listed at an incorrect price due to an error, we reserve the right to refuse or cancel orders placed for that product.
              </p>
            </div>
          </section>

          {/* Orders and Payment */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <CreditCard className="w-6 h-6 text-black" />
              <h2 className="text-2xl font-bold text-gray-900">4. Orders and Payment</h2>
            </div>
            <div className="text-gray-600 space-y-3">
              <p>
                When you place an order, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Provide valid payment information</li>
                <li>Pay all charges at the prices in effect when incurred</li>
                <li>Pay applicable taxes and shipping fees</li>
              </ul>
              <p className="mt-3">
                We accept major credit cards, debit cards, and other payment methods as displayed at checkout. All payments are processed via WhatsApp.
              </p>
              <p>
                Order confirmation does not guarantee acceptance. We reserve the right to refuse or cancel any order for any reason, including product availability, errors in pricing, or suspected fraud.
              </p>
            </div>
          </section>

          {/* Shipping and Delivery */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Shipping and Delivery</h2>
            <div className="text-gray-600 space-y-3">
              <p>
                Shipping times and costs vary based on your location and chosen shipping method. We are not responsible for delays caused by:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Shipping carriers</li>
                <li>Customs clearance</li>
                <li>Weather conditions</li>
                <li>Other circumstances beyond our control</li>
              </ul>
              <p className="mt-3">
                Standard delivery time is 3 to 5 business days. A fast delivery option is available with advance payment only, with an estimated delivery time of up to 2 business days. Delivery charges may vary depending on weight and delivery location.
              </p>
              <p className="mt-3">
                For more information, please see our <Link to="/shipping" className="text-black font-semibold hover:underline">Shipping Policy</Link>.
              </p>
            </div>
          </section>

          {/* Returns and Refunds */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Returns and Refunds</h2>
            <div className="text-gray-600 space-y-3">
              <p>
                We want you to be satisfied with your purchase. If you're not happy with your order, you may be eligible for a return or exchange within 7 days of delivery. Refunds are issued only for items returned in original and working condition and are processed after parcel inspection as per our policy.
              </p>
              <p>
                For complete details, please see our <Link to="/returns" className="text-black font-semibold hover:underline">Returns & Exchanges Policy</Link>.
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-black" />
              <h2 className="text-2xl font-bold text-gray-900">7. Intellectual Property</h2>
            </div>
            <div className="text-gray-600 space-y-3">
              <p>
                All content on this website, including text, graphics, logos, images, and software, is the property of Esfylo or its content suppliers and is protected by copyright and trademark laws.
              </p>
              <p>
                You may not:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Reproduce, distribute, or display any content without permission</li>
                <li>Use our trademarks or branding without authorization</li>
                <li>Modify or create derivative works from our content</li>
                <li>Use automated systems to access or scrape our website</li>
              </ul>
            </div>
          </section>

          {/* Prohibited Activities */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-black" />
              <h2 className="text-2xl font-bold text-gray-900">8. Prohibited Activities</h2>
            </div>
            <div className="text-gray-600 space-y-3">
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit viruses or malicious code</li>
                <li>Engage in fraudulent activities</li>
                <li>Harass or harm other users</li>
                <li>Impersonate any person or entity</li>
                <li>Interfere with the website's operation</li>
              </ul>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <div className="text-gray-600 space-y-3">
              <p>
                To the maximum extent permitted by law, Esfylo shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Your use or inability to use our services</li>
                <li>Unauthorized access to your data</li>
                <li>Errors or omissions in content</li>
                <li>Product defects or quality issues</li>
              </ul>
              <p className="mt-3">
                Our total liability shall not exceed the amount you paid for the product or service in question.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
            <p className="text-gray-600">
              These Terms of Service shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about these Terms of Service, please contact us:
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

export default TermsOfService
