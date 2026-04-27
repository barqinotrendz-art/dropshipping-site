import { Link } from 'react-router-dom'
import type { FC, ReactNode } from 'react'
import './liquidbutton.css'

interface Props {
  text: string
  to: string
  icon?: ReactNode
  className?: string   // ✅ add this
}

const LiquidButton: FC<Props> = ({ text, to, icon }) => {
  return (
    <Link
      to={to}
      onClick={(e) => e.stopPropagation()}
      className="liquid-btn"
    >
      <span className="content">
        {icon}
        {text}
      </span>
      <div className="liquid"></div>
    </Link>
  )
}

export default LiquidButton