import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Lock, Eye, Database, Mail, UserCheck } from 'lucide-react'

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-black text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-16 h-16" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Privacy Policy
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
              At Esfylo, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-6 h-6 text-black" />
              <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
            </div>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                <p>We may collect personal information that you voluntarily provide to us when you:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li>Register for an account</li>
                  <li>Make a purchase</li>
                  <li>Contact customer support</li>
                  <li>Participate in surveys or promotions</li>
                </ul>
              </div>
             
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="w-6 h-6 text-black" />
              <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
            </div>
            <div className="text-gray-600 space-y-2">
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your account and orders</li>
                <li>Send you marketing and promotional communications (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Detect and prevent fraud</li>
                <li>Comply with legal obligations</li>
                <li>Personalize your shopping experience</li>
              </ul>
            </div>
          </section>      

          {/* Data Security */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="w-6 h-6 text-black" />
              <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
            </div>
            <div className="text-gray-600 space-y-3">
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p>
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee its absolute security.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <UserCheck className="w-6 h-6 text-black" />
              <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
            </div>
            <div className="text-gray-600 space-y-2">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
              </ul>
              <p className="mt-4">
                <p><strong>Email:</strong> <a href="https://mail.google.com/mail/?view=cm&fs=1&to=only.esfylo.store@gmail.com" target="_blank" rel="noopener noreferrer" className="text-black hover:underline">only.esfylo.store@gmail.com</a></p>
                <p><strong>Phone:</strong> +92 318 5631518</p>
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
            <div className="text-gray-600 space-y-3">
              <p>
                We use cookies and similar tracking technologies to enhance your experience on our website. You can control cookies through your browser settings.
              </p>
              <p>
                For more information, please see our <Link to="/cookie-policy" className="text-black font-semibold hover:underline">Cookie Policy</Link>.
              </p>
            </div>
          </section>


          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-600">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Mail className="w-6 h-6 text-black" />
              <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
            </div>
            <p className="text-gray-600 mb-4">
              If you have any questions about this Privacy Policy, please contact us:
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

export default PrivacyPolicy
