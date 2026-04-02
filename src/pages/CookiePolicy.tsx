import React from 'react'
import { Link } from 'react-router-dom'
import { Cookie, Settings, Eye, Shield } from 'lucide-react'

const CookiePolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-black text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-4">
            <Cookie className="w-16 h-16" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Cookie Policy
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
              This Cookie Policy explains how Esfylo uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>
          </section>

          {/* What Are Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
            <div className="text-gray-600 space-y-3">
              <p>
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
              <p>
                Cookies set by the website owner (in this case, Esfylo) are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies."
              </p>
            </div>
          </section>

          {/* Types of Cookies */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="w-6 h-6 text-black" />
              <h2 className="text-2xl font-bold text-gray-900">Types of Cookies We Use</h2>
            </div>
            <div className="space-y-6">
              
              {/* Essential Cookies */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2">Essential Cookies</h3>
                <p className="text-gray-600 mb-3">
                  These cookies are strictly necessary for the website to function and cannot be switched off in our systems.
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Purpose:</strong> Authentication, security, shopping cart functionality
                </p>
              </div>

              {/* Performance Cookies */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2">Performance Cookies</h3>
                <p className="text-gray-600 mb-3">
                  These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Purpose:</strong> Analytics, page load times, error tracking
                </p>
              </div>

              {/* Functional Cookies */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2">Functional Cookies</h3>
                <p className="text-gray-600 mb-3">
                  These cookies enable enhanced functionality and personalization, such as remembering your preferences.
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Purpose:</strong> Language preferences, region settings, user preferences
                </p>
              </div>

              {/* Targeting Cookies */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2">Targeting/Advertising Cookies</h3>
                <p className="text-gray-600 mb-3">
                  These cookies may be set through our site by our advertising partners to build a profile of your interests.
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Purpose:</strong> Personalized advertising, remarketing, interest-based ads
                </p>
              </div>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="w-6 h-6 text-black" />
              <h2 className="text-2xl font-bold text-gray-900">Third-Party Cookies</h2>
            </div>
            <div className="text-gray-600 space-y-3">
              <p>
                In addition to our own cookies, we may also use various third-party cookies to report usage statistics and deliver advertisements.
              </p>
              <p>
                Third-party services we use include:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Google Analytics:</strong> For website analytics and performance tracking</li>
                <li><strong>Facebook Pixel:</strong> For advertising and remarketing</li>
                <li><strong>Payment Processors:</strong> For secure payment processing</li>
                <li><strong>Social Media Platforms:</strong> For social sharing features</li>
              </ul>
            </div>
          </section>

          {/* Managing Cookies */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-black" />
              <h2 className="text-2xl font-bold text-gray-900">How to Manage Cookies</h2>
            </div>
            <div className="text-gray-600 space-y-3">
              <p>
                You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Using our cookie consent banner when you first visit our website</li>
                <li>Modifying your browser settings to refuse cookies</li>
                <li>Deleting cookies that have already been set</li>
              </ul>
              <p className="mt-4">
                <strong>Browser Settings:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
                <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                <li><strong>Edge:</strong> Settings → Privacy → Cookies</li>
              </ul>
              <p className="mt-4 text-sm bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <strong>Note:</strong> If you choose to block all cookies, some features of our website may not function properly, and you may not be able to make purchases.
              </p>
            </div>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
            <p className="text-gray-600">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Please check this page periodically for updates.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions?</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about our use of cookies, please contact us:
            </p>
            <div className="space-y-2 text-gray-600">
              <p><strong>Email:</strong> <a href="mailto:privacy@esfylo.com" className="text-black hover:underline">privacy@esfylo.com</a></p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
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

export default CookiePolicy
