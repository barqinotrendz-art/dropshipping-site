import React from 'react'
import { type ColorVariant } from '../types'

type Props = {
  variants: ColorVariant[]
  selectedColor: ColorVariant | null
  onColorChange: (variant: ColorVariant) => void
  className?: string
}

const ColorSelector: React.FC<Props> = ({ variants, selectedColor, onColorChange, className = '' }) => {
  if (!variants || variants.length === 0) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          Color: {selectedColor ? selectedColor.name : 'Select a color'}
        </h3>
        <div className="flex flex-wrap gap-2">
          {variants.map((variant, index) => (
            <button
              key={index}
              onClick={() => onColorChange(variant)}
              className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                selectedColor?.name === variant.name
                  ? 'border-black ring-2 ring-black ring-offset-2'
                  : 'border-gray-300 hover:border-gray-400'
              } ${variant.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{ backgroundColor: variant.value }}
              disabled={variant.stock === 0}
              title={`${variant.name} ${variant.stock === 0 ? '(Out of stock)' : `(${variant.stock} in stock)`}`}
            >
              {variant.stock === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-0.5 bg-red-500 rotate-45"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {selectedColor && (
        <div className="text-sm text-gray-600">
          {selectedColor.stock > 0 ? (
            <span className="text-green-600">✓ {selectedColor.stock} in stock</span>
          ) : (
            <span className="text-red-600">✗ Out of stock</span>
          )}
        </div>
      )}
    </div>
  )
}

export default ColorSelector
