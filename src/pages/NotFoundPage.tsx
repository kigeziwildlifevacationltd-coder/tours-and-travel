import { Link } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { useTranslation } from '../context/useTranslation'
import { heroBackgroundImages } from '../data/heroImages'
import { usePageSeo } from '../seo/usePageSeo'

export function NotFoundPage() {
  const { t } = useTranslation()
  const requestTourUrl = '/tours?openCustomTour=1#custom-tour-request'

  usePageSeo({
    title: t('notFound.heroTitle'),
    description: t('notFound.heroDescription'),
    path: '/404',
    image: '/images/sunset-over-mountain-ridges-0081.jpg',
    noIndex: true,
  })

  return (
    <>
      <PageHero
        eyebrow={t('notFound.heroEyebrow')}
        title={t('notFound.heroTitle')}
        description={t('notFound.heroDescription')}
        className="hero-actions-centered hero-actions-bottom"
        actions={[
          { label: t('notFound.heroActionHome'), to: '/' },
          { label: t('notFound.heroActionTours'), to: '/tours', variant: 'secondary' },
        ]}
        highlights={[
          t('notFound.heroHighlight1'),
          t('notFound.heroHighlight2'),
          t('notFound.heroHighlight3'),
        ]}
        panel={{
          title: t('notFound.heroPanelTitle'),
          points: [
            t('notFound.heroPanelPoint1'),
            t('notFound.heroPanelPoint2'),
            t('notFound.heroPanelPoint3'),
          ],
        }}
        backgroundImages={heroBackgroundImages}
      />

      <section className="section not-found">
        <div className="container">
          <h2>{t('notFound.helpTitle')}</h2>
          <p>{t('notFound.helpDescription')}</p>
          <Link to={requestTourUrl} className="btn btn-primary">
            {t('notFound.contactTeam')}
          </Link>
        </div>
      </section>
    </>
  )
}
