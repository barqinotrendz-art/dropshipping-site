import React from 'react'
import { motion } from 'framer-motion'

interface AnimatedUnderlineHeadingProps {
  title: string
  highlightedText: string
  className?: string
  underlineColor?: string
}

const AnimatedUnderlineHeading: React.FC<AnimatedUnderlineHeadingProps> = ({
  title,
  highlightedText,
  className = '',
  underlineColor = '#20432f',
}) => {
  return (
    <h2
      className={`text-3xl md:text-5xl font-bold text-gray-900 ${className}`}
    >
      {title}{' '}
      <span
        className="relative inline-block"
        
      >
        {highlightedText}

        <svg
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-full min-w-[140px]"
          viewBox="0 0 186 24"
          fill="none"
          style={{ color: underlineColor }}
        >
          <motion.path
            d="M3 6C28 3 60 2 93 2C126 2 155 3 183 6"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          />

          <motion.path
            d="M42 11C68 9 97 9 124 11"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />

          <motion.path
            d="M72 15C88 16 101 17 107 18"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
        </svg>
      </span>
    </h2>
  )
}

export default AnimatedUnderlineHeading