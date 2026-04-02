import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const { pathname } = useLocation()

  const scrollToTop = () => {
    const activeElement = document.activeElement as HTMLElement | null
    if (activeElement && typeof activeElement.blur === 'function') {
      activeElement.blur()
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    const rootElement = document.getElementById('root')
    rootElement?.scrollTo({ top: 0, left: 0, behavior: 'auto' })

    const mainContent = document.querySelector('.mobile-content')
    if (mainContent instanceof HTMLElement) {
      mainContent.scrollTop = 0
      if (typeof mainContent.scrollTo === 'function') {
        mainContent.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      }
    }
  }

  useLayoutEffect(() => {
    scrollToTop()
  }, [pathname])

  useEffect(() => {
    const rafId = requestAnimationFrame(scrollToTop)
    const timeout = setTimeout(scrollToTop, 200)

    window.addEventListener('load', scrollToTop)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(timeout)
      window.removeEventListener('load', scrollToTop)
    }
  }, [pathname])

  return null
}

export default ScrollToTop
