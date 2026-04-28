import type { FC, ReactNode } from 'react'
import './reusable.css'

interface Props {
  text: string
  // to: string
  icon?: ReactNode
  className?: string   // ✅ add this
}


const Reusablebtn: FC<Props> = ({ text, icon }) => {
  return (
    <div className="reuse-btn">
      <span className="reuse-content">
        {icon}
        {text}
      </span>
      <div className="reuse"></div>
    </div>
  )
}

export default Reusablebtn