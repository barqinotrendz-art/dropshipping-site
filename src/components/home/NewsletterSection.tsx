import React from 'react'
import { Mail } from 'lucide-react'
import { FaFacebook, FaTiktok, FaInstagram, FaYoutube } from 'react-icons/fa'
import { useSocialSettings } from '../../hooks/useSocialSettings'

const NewsletterSection: React.FC = () => {
  const { data: socialSettings } = useSocialSettings()



  const socialLinks = [
    ...(socialSettings?.facebook ? [{ icon: FaFacebook, href: socialSettings.facebook, label: 'Facebook', color: 'hover:text-blue-600' }] : []),
    ...(socialSettings?.instagram ? [{ icon: FaInstagram, href: socialSettings.instagram, label: 'Instagram', color: 'hover:text-pink-600' }] : []),
    ...(socialSettings?.tiktok ? [{ icon: FaTiktok, href: socialSettings.tiktok, label: 'TikTok', color: 'hover:text-gray-300' }] : []),
    ...(socialSettings?.youtube ? [{ icon: FaYoutube, href: socialSettings.youtube, label: 'YouTube', color: 'hover:text-red-600' }] : [])
  ]

  return (
    <section className="py-16 bg-gradient-to-r from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">

          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-6 animate-bounce">
              <Mail className="w-8 h-8 text-black" />

            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fadeIn">
              Stay Updated
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto animate-fadeIn animation-delay-200">
              Subscribe to our social media accounts and be the first to know about new products, exclusive deals, and special offers.
            </p>


          </div>

          {/* Social Media Links */}
          {socialLinks.length > 0 && (
            <div className="border-t border-gray-700 pt-8">
              <h3 className="text-xl font-semibold text-white mb-6 animate-fadeIn animation-delay-600">
                Follow Us
              </h3>
              <div className="flex justify-center space-x-6 animate-fadeIn animation-delay-800">
                {socialLinks.map((social, index) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-all duration-300 transform hover:scale-110 ${social.color} group`}
                    aria-label={social.label}
                    style={{ animationDelay: `${800 + index * 100}ms` }}
                  >
                    <social.icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-12 animate-fadeIn animation-delay-1000">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Start Shopping?
            </h3>
            <p className="text-gray-300 mb-6">
              Discover thousands of products with fast shipping and great customer service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/products"
                className="inline-flex items-center px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                Shop Now
              </a>
              <a
                href="/about"
                className="inline-flex items-center px-8 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105"
              >
                Learn More
              </a>
            </div>
          </div>

          <div className="mt-12 text-center text-sm text-gray-400 animate-fadeIn animation-delay-1200">
            <p className="text-gray-200 text-sm">
              Easy Buy uses Google Sign-In for secure user login and account access. <br />
              For help, contact <a
                // href="mailto:"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-gray-200"
              >
                {/* only.esfylo.store@gmail.com */}
              </a>. <br />
              View our <a href="/privacy-policy" className="underline">Privacy Policy</a>.
            </p>

          </div>
        </div>
      </div>
    </section>
  )
}

export default NewsletterSection
