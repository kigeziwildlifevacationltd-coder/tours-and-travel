import { Link } from 'react-router-dom'
import { SectionHeading } from '../components/SectionHeading'
import { useTranslation } from '../context/useTranslation'
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
    <section className="section not-found">
      <div className="container">
        <SectionHeading title={t('notFound.heroTitle')} subtitle={t('notFound.heroDescription')} />
        <h2>{t('notFound.helpTitle')}</h2>
        <p>{t('notFound.helpDescription')}</p>
        <Link to={requestTourUrl} className="btn btn-primary">
          {t('notFound.contactTeam')}
        </Link>
      </div>
    </section>
  )
}
