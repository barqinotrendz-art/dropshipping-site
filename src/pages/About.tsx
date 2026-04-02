import React from 'react'
import {Heart, Shield, Truck, HeadphonesIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

const AboutPage: React.FC = () => {
 

  const features = [
    {
      icon: Shield,
      title: 'Secure Shopping',
      description: 'Your data and transactions are protected with industry-standard encryption.'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Get your orders delivered quickly with our reliable shipping partners.'
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Our customer service team is always here to help you with any questions.'
    },
    {
      icon: Heart,
      title: 'Quality Products',
      description: 'We carefully curate our products to ensure the highest quality standards.'
    },
  ]

 

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              About Esfylo
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              We're on a mission to bring you the best products at unbeatable prices.
              Since 2019, we've been committed to providing exceptional shopping experiences
              and building lasting relationships with our customers.
            </p>
          </div>
        </div>
      </section>


      {/* Our Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Esfylo was born from a simple idea: everyone deserves access to quality products
                  without breaking the bank. What started as a small online store has grown into
                  a thriving e-commerce platform serving thousands of happy customers.
                </p>
                <p>
                  We believe in transparency, quality, and customer satisfaction above all else.
                  Every product we offer is carefully selected and tested to ensure it meets our
                  high standards. Our team works tirelessly to bring you the latest trends and
                  timeless classics at prices that make sense.
                </p>
                <p>
                  Today, we're proud to be one of the fastest-growing online retailers, but we
                  haven't forgotten our roots. We still treat every customer like family and
                  every order like it's our first.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://img.freepik.com/free-vector/business-meeting-sketch-with-top-view-human-hands-writing-notes_1035-20436.jpg?t=st=1760068726~exp=1760072326~hmac=365500cd693763a361cd778d169b1474c6dd8e26d1af9f97e2c1f4adfe0168c0&w=1480"
                alt="Our Store"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-black text-white p-6 rounded-xl shadow-xl">
                <div className="text-3xl font-bold mb-1">5+</div>
                <div className="text-sm">Years of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We go above and beyond to ensure your shopping experience is seamless and enjoyable
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Shopping?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover thousands of products from top brands at unbeatable prices
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="px-8 py-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Browse Products
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-black transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
