import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from '../context/useTranslation'
import { Footer } from './Footer'
import { FloatingWhatsApp } from './FloatingWhatsApp'
import { Navbar } from './Navbar'

export function SiteLayout() {
  const { t } = useTranslation()
  const location = useLocation()

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const hash = location.hash
    let rafId: number | null = null
    let attempts = 0
    const maxAttempts = 12

    const scrollToTarget = () => {
      if (hash) {
        const targetId = decodeURIComponent(hash.slice(1))
        const target = document.getElementById(targetId)

        if (target) {
          target.scrollIntoView({ block: 'start' })
          return
        }

        if (attempts < maxAttempts) {
          attempts += 1
          rafId = window.requestAnimationFrame(scrollToTarget)
          return
        }
      }

      window.scrollTo({ top: 0, left: 0 })
    }

    scrollToTarget()

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [location.pathname, location.search, location.hash])

  return (
    <div className="site-frame">
      <a className="skip-link" href="#main-content">
        {t('a11y.skipToMain')}
      </a>
      <Navbar />
      <FloatingWhatsApp />
      <main id="main-content" className="site-main">
        <span id="page-content" aria-hidden="true" />
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
