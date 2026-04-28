import type { FC, ReactNode } from 'react'
import './liquidbutton.css'

interface Props {
  text: string
  // to: string
  icon?: ReactNode
  className?: string   // ✅ add this
}


const LiquidButton: FC<Props> = ({ text, icon }) => {
  return (
    <div className="liquid-btn">
      <span className="content">
        {icon}
        {text}
      </span>
      <div className="liquid"></div>
    </div>
  )
}

export default LiquidButton