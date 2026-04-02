import React from 'react'
import { Link } from 'react-router-dom'
import { FaInstagram, FaFacebook, FaTiktok, FaYoutube } from "react-icons/fa";
import { useSocialSettings } from '../hooks/useSocialSettings'
import logo from '../assets/logo.jpeg'

const Footer: React.FC = () => {
  const { data: socialSettings } = useSocialSettings()

  return (
    <footer className="bg-black text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <img src={logo} alt="Easy Buy" className="w-full h-full object-cover rounded-full" />
              </div>
              <span className="text-2xl font-mono font-bold">Easy Buy</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your one-stop destination for premium products at unbeatable prices. 
              Quality guaranteed, fast shipping worldwide.
            </p>
            <div className="flex space-x-4">
              {socialSettings?.facebook && (
                <a
                  href={socialSettings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-gray-400 text-2xl hover:text-white transition-colors"
                >
                  <span><FaFacebook /></span>
                </a>
              )}
              {socialSettings?.instagram && (
                <a
                  href={socialSettings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-gray-400 text-2xl hover:text-white transition-colors"
                >
                  <span><FaInstagram /></span>
                </a>
              )}
              {socialSettings?.tiktok && (
                <a
                  href={socialSettings.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Tiktok"
                  className="text-gray-400 text-2xl hover:text-white transition-colors"
                >
                  <span><FaTiktok /></span>
                </a>
              )}
              {socialSettings?.youtube && (
                <a
                  href={socialSettings.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="text-gray-400 text-2xl hover:text-white transition-colors"
                >
                  <span><FaYoutube /></span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white transition-colors text-sm">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Shopping Cart
                </Link>
              </li>
            
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

        
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-400">
              {/* <p>&copy; 2024 Easy Buy. All rights reserved.</p> */}
              <div className="flex space-x-4">
                <Link to="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms-of-service" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link to="/cookie-policy" className="hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
