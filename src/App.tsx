import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { SiteLayout } from './components/SiteLayout'

const HomePage = lazy(async () => ({ default: (await import('./pages/HomePage')).HomePage }))
const ToursPage = lazy(async () => ({ default: (await import('./pages/ToursPage')).ToursPage }))
const TourDetailPage = lazy(
  async () => ({ default: (await import('./pages/TourDetailPage')).TourDetailPage }),
)
const ServicesPage = lazy(
  async () => ({ default: (await import('./pages/ServicesPage')).ServicesPage }),
)
const ServiceDetailPage = lazy(
  async () => ({ default: (await import('./pages/ServiceDetailPage')).ServiceDetailPage }),
)
const DestinationsPage = lazy(
  async () => ({ default: (await import('./pages/DestinationsPage')).DestinationsPage }),
)
const AboutPage = lazy(async () => ({ default: (await import('./pages/AboutPage')).AboutPage }))
const GalleryPage = lazy(
  async () => ({ default: (await import('./pages/GalleryPage')).GalleryPage }),
)
const ExperiencesPage = lazy(
  async () => ({ default: (await import('./pages/ExperiencesPage')).ExperiencesPage }),
)
const ContactPage = lazy(async () => ({ default: (await import('./pages/ContactPage')).ContactPage }))
const SiteMapPage = lazy(async () => ({ default: (await import('./pages/SiteMapPage')).SiteMapPage }))
const NotFoundPage = lazy(
  async () => ({ default: (await import('./pages/NotFoundPage')).NotFoundPage }),
)

const routeFallback = (
  <section className="section">
    <div className="container" />
  </section>
)

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route
          index
          element={
            <Suspense fallback={routeFallback}>
              <HomePage />
            </Suspense>
          }
        />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route
          path="/tours"
          element={
            <Suspense fallback={routeFallback}>
              <ToursPage />
            </Suspense>
          }
        />
        <Route
          path="/tours/:tourId"
          element={
            <Suspense fallback={routeFallback}>
              <TourDetailPage />
            </Suspense>
          }
        />
        <Route
          path="/services"
          element={
            <Suspense fallback={routeFallback}>
              <ServicesPage />
            </Suspense>
          }
        />
        <Route
          path="/services/:serviceId"
          element={
            <Suspense fallback={routeFallback}>
              <ServiceDetailPage />
            </Suspense>
          }
        />
        <Route
          path="/destinations"
          element={
            <Suspense fallback={routeFallback}>
              <DestinationsPage />
            </Suspense>
          }
        />
        <Route
          path="/about"
          element={
            <Suspense fallback={routeFallback}>
              <AboutPage />
            </Suspense>
          }
        />
        <Route
          path="/gallery"
          element={
            <Suspense fallback={routeFallback}>
              <GalleryPage />
            </Suspense>
          }
        />
        <Route
          path="/experiences"
          element={
            <Suspense fallback={routeFallback}>
              <ExperiencesPage />
            </Suspense>
          }
        />
        <Route
          path="/contact-us"
          element={
            <Suspense fallback={routeFallback}>
              <ContactPage />
            </Suspense>
          }
        />
        <Route
          path="/site-map"
          element={
            <Suspense fallback={routeFallback}>
              <SiteMapPage />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={routeFallback}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
