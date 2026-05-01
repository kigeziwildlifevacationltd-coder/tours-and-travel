import { SectionHeading } from '../components/SectionHeading'
import { ExperienceCallout } from '../components/ExperienceCallout'
import { useTranslation } from '../context/useTranslation'
import { stats } from '../data/siteContent'
import {
  GORILLA_TREKKING_KEYWORDS,
  UGANDA_SAFARI_KEYWORDS,
  buildEntityKeywordCluster,
  buildPageKeywordCluster,
} from '../seo/keywordClusters'
import { usePageSeo } from '../seo/usePageSeo'
import companyLogo from '../assets/logo.png'

export function AboutPage() {
  const { t } = useTranslation()
  const productsOffered = [
    t('about.productService1'),
    t('about.productService2'),
    t('about.productService3'),
    t('about.productService4'),
    t('about.productService5'),
    t('about.productService6'),
    t('about.productService7'),
    t('about.productService8'),
  ]
  const coreValues = [
    t('about.coreValue1'),
    t('about.coreValue2'),
    t('about.coreValue3'),
    t('about.coreValue4'),
    t('about.coreValue5'),
  ]
  const milestones = [
    t('about.milestone1'),
    t('about.milestone2'),
    t('about.milestone3'),
    t('about.milestone4'),
  ]
  const licensesAndCertifications = [
    t('about.license1'),
    t('about.license2'),
    t('about.license3'),
  ]
  const reputationHighlights = [
    t('about.reputation1'),
    t('about.reputation2'),
    t('about.reputation3'),
  ]
  const aboutEntityKeywords = buildEntityKeywordCluster('service', productsOffered, 24)
  const aboutPageKeywordCluster = buildPageKeywordCluster(
    UGANDA_SAFARI_KEYWORDS,
    GORILLA_TREKKING_KEYWORDS,
    aboutEntityKeywords,
    110,
  )

  usePageSeo({
    title: t('about.heroTitle'),
    description: t('about.heroDescription'),
    path: '/about',
    image: '/images/sunset-over-mountain-ridges-0081.jpg',
    imageAlt: 'Uganda safari company and tour operator team',
    preloadImage: '/images/sunset-over-mountain-ridges-0081.jpg',
    keywords: aboutPageKeywordCluster,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: t('about.heroTitle'),
      description: t('about.heroDescription'),
      publisher: {
        '@type': 'Organization',
        name: 'Kigezi Wildlife Vacation Safaris',
      },
    },
  })

  const getStatLabel = (label: string) => {
    if (label === 'Years Of Field Experience') {
      return t('stats.yearsExperience')
    }

    if (label === 'Planned Itineraries') {
      return t('stats.plannedItineraries')
    }

    if (label === 'National Parks Covered') {
      return t('stats.parksCovered')
    }

    if (label === 'Client Satisfaction') {
      return t('stats.clientSatisfaction')
    }

    return label
  }

  return (
    <>
      <section className="section">
        <div className="container">
          <SectionHeading title={t('about.companyProfileTitle')} subtitle={t('about.companyProfileSubtitle')} />

          <div className="about-company-grid">
            <article className="content-card about-company-card">
              <div className="about-company-identity">
                <img
                  src={companyLogo}
                  alt={t('brand.logoAlt')}
                  className="about-company-logo"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
                <div>
                  <h3>{t('brand.name')}</h3>
                  <p>{t('about.companyNameLabel')}</p>
                  <p className="about-company-slogan">
                    <strong>{t('about.sloganLabel')}:</strong> {t('about.sloganValue')}
                  </p>
                </div>
              </div>

              <div className="stats-list">
                <div className="stats-list-item">
                  <strong>{t('about.yearFoundedLabel')}</strong>
                  <span>{t('about.yearFoundedValue')}</span>
                </div>
                <div className="stats-list-item">
                  <strong>{t('about.foundersLabel')}</strong>
                  <span>{t('about.foundersValue')}</span>
                </div>
                <div className="stats-list-item">
                  <strong>{t('about.missionLabel')}</strong>
                  <span>{t('about.missionValue')}</span>
                </div>
                <div className="stats-list-item">
                  <strong>{t('about.visionLabel')}</strong>
                  <span>{t('about.visionValue')}</span>
                </div>
              </div>
            </article>

            <article className="content-card about-company-card">
              <SectionHeading title={t('about.companyHistoryTitle')} />
              <p>{t('about.companyHistoryBody')}</p>
              <SectionHeading title={t('about.productsTitle')} />
              <ul className="service-detail-list">
                {productsOffered.map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="card-grid feature-grid">
            <article className="content-card feature-card">
              <h3>{t('about.coreValuesTitle')}</h3>
              <ul className="service-detail-list">
                {coreValues.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
            </article>

            <article className="content-card feature-card">
              <h3>{t('about.milestonesTitle')}</h3>
              <ul className="service-detail-list">
                {milestones.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="content-card feature-card">
              <h3>{t('about.licensesTitle')}</h3>
              <ul className="service-detail-list">
                {licensesAndCertifications.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container about-grid">
          <article className="content-card">
            <SectionHeading title={t('about.reputationTitle')} />
            <p>
              <strong>{t('stats.clientSatisfaction')}:</strong> 98%
            </p>
            <ul className="service-detail-list">
              {reputationHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <aside className="content-card">
            <SectionHeading title={t('about.snapshotTitle')} />
            <div className="stats-list">
              {stats.map((item) => (
                <div key={item.label} className="stats-list-item">
                  <strong>{item.value}</strong>
                  <span>{getStatLabel(item.label)}</span>
                </div>
              ))}
            </div>
            <p>{t('about.snapshotParagraph')}</p>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container about-grid">
          <article className="content-card">
            <SectionHeading title={t('about.howWePlanTitle')} />
            <p>{t('about.howWePlanParagraph1')}</p>
            <p>{t('about.howWePlanParagraph2')}</p>
            <p>{t('about.howWePlanParagraph3')}</p>
          </article>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionHeading
            title={t('about.detailsTitle')}
            subtitle={t('about.detailsSubtitle')}
          />
          <div className="card-grid feature-grid">
            <article className="content-card feature-card">
              <h3>{t('about.detailsCard1Title')}</h3>
              <p>{t('about.detailsCard1Body')}</p>
            </article>
            <article className="content-card feature-card">
              <h3>{t('about.detailsCard2Title')}</h3>
              <p>{t('about.detailsCard2Body')}</p>
            </article>
            <article className="content-card feature-card">
              <h3>{t('about.detailsCard3Title')}</h3>
              <p>{t('about.detailsCard3Body')}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <ExperienceCallout align="center" />
        </div>
      </section>
    </>
  )
}
