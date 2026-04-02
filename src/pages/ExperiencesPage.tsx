import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { SectionHeading } from '../components/SectionHeading'
import { useTranslation } from '../context/useTranslation'
import { heroBackgroundImages } from '../data/heroImages'
import { tours } from '../data/siteContent'
import {
  GORILLA_TREKKING_KEYWORDS,
  UGANDA_SAFARI_KEYWORDS,
  buildKeywordCluster,
  buildPageKeywordCluster,
} from '../seo/keywordClusters'
import { usePageSeo } from '../seo/usePageSeo'
import { isSupabaseConfigured, supabase } from '../utils/supabaseClient'
import { useSupabaseSession } from '../hooks/useSupabaseSession'

type ProfileRecord = {
  id: string
  display_name: string
  country: string | null
  avatar_url: string | null
  bio: string | null
}

type ExperienceRecord = {
  id: string
  title: string
  summary: string | null
  content: string
  rating: number | null
  trip_month: string | null
  tour_id: string | null
  created_at: string
  profiles?: {
    display_name?: string | null
    country?: string | null
    avatar_url?: string | null
  } | null
}

function formatDateLabel(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleDateString()
}

function formatTripMonthLabel(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const parsed = new Date(`${value}-01`)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
}

const profileSectionId = 'traveler-profile'
const authSectionId = 'experience-auth'
const shareSectionId = 'share-experience'
const feedSectionId = 'experience-feed'
const ratingScale = [1, 2, 3, 4, 5]

export function ExperiencesPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const session = useSupabaseSession()
  const supabaseReady = isSupabaseConfigured && Boolean(supabase)
  const [profile, setProfile] = useState<ProfileRecord | null>(null)
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    country: '',
    bio: '',
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [authEmail, setAuthEmail] = useState('')
  const [authStatus, setAuthStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [authError, setAuthError] = useState<string | null>(null)

  const [experienceForm, setExperienceForm] = useState({
    title: '',
    summary: '',
    content: '',
    tourId: '',
    tripMonth: '',
    rating: 5,
  })
  const [experienceSubmitting, setExperienceSubmitting] = useState(false)
  const [experienceMessage, setExperienceMessage] = useState<string | null>(null)
  const [experienceError, setExperienceError] = useState<string | null>(null)

  const [experiences, setExperiences] = useState<ExperienceRecord[]>([])
  const [experiencesLoading, setExperiencesLoading] = useState(false)
  const [experiencesError, setExperiencesError] = useState<string | null>(null)
  const prefillParams = useMemo(() => {
    if (!location.search) {
      return { tourId: '', rating: 0 }
    }

    const params = new URLSearchParams(location.search)
    const requestedTourId = params.get('tour') ?? ''
    const ratingValue = Number.parseInt(params.get('rating') ?? '', 10)
    const normalizedRating =
      Number.isFinite(ratingValue) && ratingValue >= 1 && ratingValue <= 5 ? ratingValue : 0
    const validTour = tours.some((tour) => tour.id === requestedTourId)

    return {
      tourId: validTour ? requestedTourId : '',
      rating: normalizedRating,
    }
  }, [location.search, tours])

  const experienceKeywords = buildKeywordCluster(
    [
      'Uganda safari reviews',
      'traveler experiences',
      'safari trip ratings',
      'gorilla trekking feedback',
      'wildlife safari stories',
    ],
    [],
    24,
  )
  const experiencesPageKeywordCluster = buildPageKeywordCluster(
    UGANDA_SAFARI_KEYWORDS,
    GORILLA_TREKKING_KEYWORDS,
    experienceKeywords,
    110,
  )

  usePageSeo({
    title: t('experiences.heroTitle'),
    description: t('experiences.heroDescription'),
    path: '/experiences',
    image: '/images/group-watching-sunset-0023.jpg',
    imageAlt: 'Safari travelers sharing experiences and reviews',
    preloadImage: '/images/group-watching-sunset-0023.jpg',
    keywords: experiencesPageKeywordCluster,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: t('experiences.heroTitle'),
      description: t('experiences.heroDescription'),
    },
  })

  useEffect(() => {
    const supabaseClient = supabase

    if (!supabaseReady || !session || !supabaseClient) {
      setProfile(null)
      setProfileForm({ displayName: '', country: '', bio: '' })
      setAvatarFile(null)
      setAvatarPreview(null)
      return
    }

    let isActive = true
    const metadata = session.user.user_metadata as Record<string, unknown> | undefined
    const metadataName =
      typeof metadata?.full_name === 'string'
        ? metadata.full_name
        : typeof metadata?.name === 'string'
          ? metadata.name
          : ''
    const metadataAvatar =
      typeof metadata?.avatar_url === 'string'
        ? metadata.avatar_url
        : typeof metadata?.picture === 'string'
          ? metadata.picture
          : ''

    const loadProfile = async () => {
      try {
        const { data, error } = await supabaseClient
          .from('profiles')
          .select('id, display_name, country, avatar_url, bio')
          .eq('id', session.user.id)
          .maybeSingle()

        if (!isActive) {
          return
        }

        if (error) {
          console.warn('[experiences] Failed to load profile.', error)
          setProfile(null)
          return
        }

        const nextProfile = data as ProfileRecord | null
        setProfile(nextProfile)
        setProfileForm({
          displayName: nextProfile?.display_name ?? metadataName ?? '',
          country: nextProfile?.country ?? '',
          bio: nextProfile?.bio ?? '',
        })
        setAvatarFile(null)
        setAvatarPreview(nextProfile?.avatar_url ?? metadataAvatar ?? null)
      } catch {
        if (isActive) {
          setProfile(null)
        }
      }
    }

    void loadProfile()

    return () => {
      isActive = false
    }
  }, [session, supabaseReady])

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  const loadExperiences = useCallback(async () => {
    if (!supabaseReady) {
      setExperiences([])
      return
    }

    setExperiencesLoading(true)
    setExperiencesError(null)

    const { data, error } = await supabase!
      .from('experiences')
      .select('id, title, summary, content, rating, trip_month, tour_id, created_at, profiles (display_name, country, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(12)

    if (error) {
      console.warn('[experiences] Failed to load experiences.', error)
      setExperiencesError(t('experiences.feedError'))
      setExperiences([])
    } else {
      setExperiences((data ?? []) as ExperienceRecord[])
    }

    setExperiencesLoading(false)
  }, [supabaseReady, t])

  useEffect(() => {
    void loadExperiences()
  }, [loadExperiences])

  useEffect(() => {
    if (!prefillParams.tourId && !prefillParams.rating) {
      return
    }

    setExperienceForm((current) => ({
      ...current,
      tourId: prefillParams.tourId || current.tourId,
      rating: prefillParams.rating || current.rating,
    }))
  }, [prefillParams])

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileMessage(null)
    setProfileError(null)
    setAvatarUploadError(null)

    if (!supabaseReady || !session) {
      setProfileError(t('experiences.profileSignInPrompt'))
      return
    }

    const displayName = profileForm.displayName.trim()

    if (!displayName) {
      setProfileError(t('experiences.profileDisplayNameRequired'))
      return
    }

    setProfileSaving(true)

    let avatarUrl =
      profile?.avatar_url ?? (avatarPreview && !avatarPreview.startsWith('blob:') ? avatarPreview : null)

    if (avatarFile) {
      setAvatarUploading(true)
      const safeFileName = avatarFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const filePath = `${session.user.id}/${Date.now()}-${safeFileName}`

      const { error: uploadError } = await supabase!
        .storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true, contentType: avatarFile.type })

      if (uploadError) {
        console.warn('[experiences] Failed to upload avatar.', uploadError)
        setAvatarUploadError(t('experiences.profileAvatarUploadError'))
        setAvatarUploading(false)
        setProfileSaving(false)
        return
      }

      const { data } = supabase!.storage.from('avatars').getPublicUrl(filePath)
      avatarUrl = data.publicUrl ?? avatarUrl
      setAvatarUploading(false)
    }

    const payload = {
      id: session.user.id,
      display_name: displayName,
      country: profileForm.country.trim() || null,
      avatar_url: avatarUrl,
      bio: profileForm.bio.trim() || null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase!.from('profiles').upsert(payload, { onConflict: 'id' })

    if (error) {
      console.warn('[experiences] Failed to save profile.', error)
      setProfileError(t('experiences.profileError'))
    } else {
      setProfileMessage(t('experiences.profileSaved'))
      setProfile(payload as ProfileRecord)
      setAvatarFile(null)
      if (avatarUrl) {
        setAvatarPreview(avatarUrl)
      }
    }

    setProfileSaving(false)
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null

    if (!file) {
      setAvatarFile(null)
      return
    }

    if (!file.type.startsWith('image/')) {
      setAvatarUploadError(t('experiences.profileAvatarTypeError'))
      setAvatarFile(null)
      return
    }

    const maxBytes = 2 * 1024 * 1024

    if (file.size > maxBytes) {
      setAvatarUploadError(t('experiences.profileAvatarSizeError'))
      setAvatarFile(null)
      return
    }

    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview)
    }

    setAvatarUploadError(null)
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleExperienceSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setExperienceMessage(null)
    setExperienceError(null)

    if (!supabaseReady || !session) {
      setExperienceError(t('experiences.shareSignInPrompt'))
      return
    }

    if (!profile) {
      setExperienceError(t('experiences.shareProfileRequired'))
      return
    }

    const title = experienceForm.title.trim()
    const content = experienceForm.content.trim()

    if (!title || !content) {
      setExperienceError(t('experiences.shareRequiredFields'))
      return
    }

    setExperienceSubmitting(true)

    const payload = {
      user_id: session.user.id,
      title,
      summary: experienceForm.summary.trim() || null,
      content,
      rating: experienceForm.rating,
      tour_id: experienceForm.tourId || null,
      trip_month: experienceForm.tripMonth || null,
    }

    const { error } = await supabase!.from('experiences').insert(payload)

    if (error) {
      console.warn('[experiences] Failed to submit experience.', error)
      setExperienceError(t('experiences.shareError'))
    } else {
      if (experienceForm.tourId) {
        const { error: ratingError } = await supabase!.from('tour_ratings').upsert(
          {
            tour_id: experienceForm.tourId,
            user_id: session.user.id,
            rating: experienceForm.rating,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'tour_id,user_id' },
        )

        if (ratingError) {
          console.warn('[experiences] Failed to sync tour rating.', ratingError)
        }
      }

      setExperienceMessage(t('experiences.shareSuccess'))
      setExperienceForm({
        title: '',
        summary: '',
        content: '',
        tourId: '',
        tripMonth: '',
        rating: 5,
      })
      void loadExperiences()
    }

    setExperienceSubmitting(false)
  }

  const handleSendMagicLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthError(null)
    setAuthStatus('idle')

    if (!supabaseReady) {
      setAuthError(t('experiences.supabaseMissingBody'))
      return
    }

    const email = authEmail.trim()

    if (!email) {
      setAuthError(t('experiences.authEmailRequired'))
      return
    }

    setAuthStatus('sending')

    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/experiences${window.location.search}${window.location.hash}`
        : undefined
    const { error } = await supabase!.auth.signInWithOtp({
      email,
      options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
    })

    if (error) {
      console.warn('[experiences] Failed to send magic link.', error)
      const errorCode = error.code ?? ''
      const errorMessage = error.message.toLowerCase()
      const treatAsSent =
        errorCode === 'user_already_exists' ||
        errorCode === 'email_exists' ||
        errorCode === 'over_email_send_rate_limit' ||
        errorCode === 'over_request_rate_limit' ||
        errorMessage.includes('already registered')

      if (treatAsSent) {
        setAuthStatus('sent')
        return
      }

      setAuthError(t('experiences.authError'))
      setAuthStatus('idle')
    } else {
      setAuthStatus('sent')
    }
  }

  const handleSignOut = async () => {
    if (!supabaseReady) {
      return
    }

    await supabase!.auth.signOut()
  }

  const canShareExperience = supabaseReady && Boolean(session) && Boolean(profile)
  const showProfileForm = supabaseReady && Boolean(session)
  const showShareForm = canShareExperience
  const displayName = profile?.display_name ?? t('experiences.feedAnonymous')
  const profileTourLabel = useMemo(() => t('experiences.shareTourLabel'), [t])
  const storyCharacterCount = experienceForm.content.trim().length

  return (
    <>
      <PageHero
        className="hero-actions-centered hero-actions-bottom"
        actions={[
          { label: t('experiences.heroActionPrimary'), to: `/experiences#${profileSectionId}` },
          { label: t('experiences.heroActionSecondary'), to: `/experiences#${shareSectionId}`, variant: 'secondary' },
        ]}
        backgroundImages={heroBackgroundImages}
      />

      <section className="section">
        <div className="container experiences-layout">
          <div className="experiences-forms">
            {!supabaseReady ? (
              <article className="content-card experiences-message">
                <SectionHeading title={t('experiences.supabaseMissingTitle')} />
                <p>{t('experiences.supabaseMissingBody')}</p>
              </article>
            ) : (
              <>
                <article className="content-card experiences-steps">
                  <div className="experiences-steps-header">
                    <SectionHeading title={t('experiences.stepsTitle')} subtitle={t('experiences.stepsSubtitle')} />
                    <div className="experiences-steps-actions">
                      <Link to={`#${authSectionId}`} className="btn btn-ghost btn-compact">
                        {t('experiences.authTitle')}
                      </Link>
                      <Link to={`#${profileSectionId}`} className="btn btn-secondary btn-compact">
                        {t('experiences.heroActionPrimary')}
                      </Link>
                      <Link to={`#${shareSectionId}`} className="btn btn-primary btn-compact">
                        {t('experiences.heroActionSecondary')}
                      </Link>
                    </div>
                  </div>
                  <div className="experiences-step-grid">
                    <div className="experiences-step-card" data-step="1">
                      <h3>{t('experiences.stepsOneTitle')}</h3>
                      <p>{t('experiences.stepsOneBody')}</p>
                    </div>
                    <div className="experiences-step-card" data-step="2">
                      <h3>{t('experiences.stepsTwoTitle')}</h3>
                      <p>{t('experiences.stepsTwoBody')}</p>
                    </div>
                    <div className="experiences-step-card" data-step="3">
                      <h3>{t('experiences.stepsThreeTitle')}</h3>
                      <p>{t('experiences.stepsThreeBody')}</p>
                    </div>
                  </div>
                  <div className="experiences-steps-highlights">
                    <span>{t('experiences.heroHighlight1')}</span>
                    <span>{t('experiences.heroHighlight2')}</span>
                    <span>{t('experiences.heroHighlight3')}</span>
                  </div>
                </article>

                <article className="content-card experiences-auth" id={authSectionId}>
                  <SectionHeading title={t('experiences.authTitle')} subtitle={t('experiences.authSubtitle')} />
                  {session ? (
                    <div className="auth-status">
                      <p>
                        {t('experiences.authSignedInAs')} {session.user.email ?? session.user.id}
                      </p>
                      <button type="button" className="btn btn-ghost" onClick={handleSignOut}>
                        {t('experiences.authSignOut')}
                      </button>
                    </div>
                  ) : (
                    <form className="contact-form" onSubmit={handleSendMagicLink}>
                      <label>
                        {t('experiences.authEmailLabel')}
                        <input
                          type="email"
                          name="email"
                          autoComplete="email"
                          value={authEmail}
                          onChange={(event) => setAuthEmail(event.target.value)}
                          placeholder="you@example.com"
                          required
                        />
                      </label>
                      <button type="submit" className="btn btn-primary" disabled={authStatus === 'sending'}>
                        {t('experiences.authSendLink')}
                      </button>
                      {authStatus === 'sent' ? (
                        <p className="form-success">{t('experiences.authSent')}</p>
                      ) : null}
                      {authError ? <p className="form-error">{authError}</p> : null}
                    </form>
                  )}
                </article>

                <article className="content-card experiences-profile" id={profileSectionId}>
                  <SectionHeading title={t('experiences.profileTitle')} subtitle={t('experiences.profileSubtitle')} />
                  {showProfileForm ? (
                    <form className="contact-form" onSubmit={handleProfileSubmit}>
                      <div className="contact-form-row">
                        <label>
                          {t('experiences.profileDisplayName')}
                          <input
                            type="text"
                            name="displayName"
                            value={profileForm.displayName}
                            onChange={(event) =>
                              setProfileForm((current) => ({ ...current, displayName: event.target.value }))
                            }
                            placeholder={displayName}
                            required
                          />
                        </label>
                        <label>
                          {t('experiences.profileCountry')}
                          <input
                            type="text"
                            name="country"
                            value={profileForm.country}
                            onChange={(event) =>
                              setProfileForm((current) => ({ ...current, country: event.target.value }))
                            }
                            placeholder="Uganda"
                          />
                        </label>
                      </div>
                      <label>
                        {t('experiences.profileAvatarUpload')}
                        <input type="file" accept="image/*" onChange={handleAvatarChange} />
                        <span className="form-helper">{t('experiences.profileAvatarHelp')}</span>
                      </label>
                      {avatarPreview ? (
                        <div className="avatar-preview">
                          <p className="avatar-preview-label">{t('experiences.profileAvatarCurrent')}</p>
                          <img
                            src={avatarPreview}
                            alt={t('experiences.profileAvatarCurrent')}
                            className="experience-avatar"
                            loading="lazy"
                            decoding="async"
                            width={52}
                            height={52}
                          />
                        </div>
                      ) : null}
                      <label>
                        {t('experiences.profileBio')}
                        <textarea
                          name="bio"
                          rows={4}
                          value={profileForm.bio}
                          onChange={(event) =>
                            setProfileForm((current) => ({ ...current, bio: event.target.value }))
                          }
                          placeholder={t('experiences.profileBioPlaceholder')}
                        />
                      </label>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={profileSaving || avatarUploading}
                      >
                        {t('experiences.profileSave')}
                      </button>
                      {profileMessage ? <p className="form-success">{profileMessage}</p> : null}
                      {avatarUploadError ? <p className="form-error">{avatarUploadError}</p> : null}
                      {profileError ? <p className="form-error">{profileError}</p> : null}
                    </form>
                  ) : (
                    <p className="experiences-muted">{t('experiences.profileSignInPrompt')}</p>
                  )}
                </article>

                <article className="content-card experiences-share" id={shareSectionId}>
                  <SectionHeading title={t('experiences.shareTitle')} subtitle={t('experiences.shareSubtitle')} />
                  {showShareForm ? (
                    <form className="contact-form" onSubmit={handleExperienceSubmit}>
                      <label>
                        {t('experiences.shareTitleLabel')}
                        <input
                          type="text"
                          name="title"
                          value={experienceForm.title}
                          onChange={(event) =>
                            setExperienceForm((current) => ({ ...current, title: event.target.value }))
                          }
                          placeholder={t('experiences.shareTitlePlaceholder')}
                          required
                        />
                      </label>
                      <label>
                        {t('experiences.shareSummaryLabel')}
                        <input
                          type="text"
                          name="summary"
                          value={experienceForm.summary}
                          onChange={(event) =>
                            setExperienceForm((current) => ({ ...current, summary: event.target.value }))
                          }
                          placeholder={t('experiences.shareSummaryPlaceholder')}
                        />
                      </label>
                      <div className="contact-form-row">
                        <label>
                          {profileTourLabel}
                          <select
                            name="tourId"
                            value={experienceForm.tourId}
                            onChange={(event) =>
                              setExperienceForm((current) => ({ ...current, tourId: event.target.value }))
                            }
                          >
                            <option value="">{t('experiences.shareTourPlaceholder')}</option>
                            {tours.map((tour) => (
                              <option key={tour.id} value={tour.id}>
                                {tour.title}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          {t('experiences.shareRatingLabel')}
                          <select
                            name="rating"
                            value={experienceForm.rating}
                            onChange={(event) =>
                              setExperienceForm((current) => ({
                                ...current,
                                rating: Number.parseInt(event.target.value, 10),
                              }))
                            }
                          >
                            {[5, 4, 3, 2, 1].map((rating) => (
                              <option key={rating} value={rating}>
                                {rating}/5
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <label>
                        {t('experiences.shareTripMonthLabel')}
                        <input
                          type="month"
                          name="tripMonth"
                          value={experienceForm.tripMonth}
                          onChange={(event) =>
                            setExperienceForm((current) => ({ ...current, tripMonth: event.target.value }))
                          }
                        />
                      </label>
                      <label>
                        {t('experiences.shareStoryLabel')}
                        <textarea
                          name="content"
                          rows={6}
                          value={experienceForm.content}
                          onChange={(event) =>
                            setExperienceForm((current) => ({ ...current, content: event.target.value }))
                          }
                          placeholder={t('experiences.shareStoryPlaceholder')}
                          required
                        />
                        <span className="form-helper">
                          {t('experiences.shareStoryCountLabel')}: {storyCharacterCount}
                        </span>
                      </label>
                      <button type="submit" className="btn btn-primary" disabled={experienceSubmitting}>
                        {t('experiences.shareSubmit')}
                      </button>
                      {experienceMessage ? <p className="form-success">{experienceMessage}</p> : null}
                      {experienceError ? <p className="form-error">{experienceError}</p> : null}
                    </form>
                  ) : (
                    <p className="experiences-muted">
                      {session ? t('experiences.shareProfileRequired') : t('experiences.shareSignInPrompt')}
                    </p>
                  )}
                </article>
              </>
            )}
          </div>

          <aside className="experiences-feed" id={feedSectionId}>
            <div className="experiences-feed-header">
              <SectionHeading title={t('experiences.feedTitle')} subtitle={t('experiences.feedSubtitle')} />
              <div className="experiences-feed-actions">
                <Link to={`#${shareSectionId}`} className="btn btn-secondary btn-compact">
                  {t('experiences.heroActionSecondary')}
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost btn-compact"
                  onClick={() => void loadExperiences()}
                  disabled={experiencesLoading}
                >
                  {t('experiences.feedRefresh')}
                </button>
              </div>
            </div>
            {experiencesLoading ? (
              <p className="experiences-muted">{t('experiences.feedLoading')}</p>
            ) : experiencesError ? (
              <p className="form-error">{experiencesError}</p>
            ) : experiences.length === 0 ? (
              <p className="experiences-muted">{t('experiences.feedEmpty')}</p>
            ) : (
              <div className="experiences-feed-list">
                {experiences.map((entry) => {
                  const name = entry.profiles?.display_name ?? t('experiences.feedAnonymous')
                  const country = entry.profiles?.country
                  const avatar = entry.profiles?.avatar_url
                  const tripDate = formatTripMonthLabel(entry.trip_month)
                  const createdAt = formatDateLabel(entry.created_at) ?? t('experiences.feedUnknownDate')
                  const ratingValue = entry.rating ?? 0
                  const ratingLabel = `${ratingValue}/5`

                  return (
                    <article key={entry.id} className="content-card experience-card">
                      <div className="experience-header">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={`${name} avatar`}
                            className="experience-avatar"
                            loading="lazy"
                            decoding="async"
                            width={52}
                            height={52}
                          />
                        ) : (
                          <div className="experience-avatar placeholder" aria-hidden="true" />
                        )}
                        <div>
                          <p className="experience-name">{name}</p>
                          <p className="experience-meta">
                            {country ? <span>{country}</span> : null}
                            <span>{createdAt}</span>
                          </p>
                        </div>
                        <div
                          className="experience-rating"
                          aria-label={`${t('experiences.feedRatingLabel')}: ${ratingLabel}`}
                        >
                          <span className="experience-rating-score">{ratingLabel}</span>
                          <div className="experience-rating-stars" aria-hidden="true">
                            {ratingScale.map((star) => (
                              <span
                                key={star}
                                className={`experience-star ${star <= ratingValue ? 'filled' : ''}`}
                              >
                                &#9733;
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <h3 className="experience-title">{entry.title}</h3>
                      {entry.summary ? <p className="experience-summary">{entry.summary}</p> : null}
                      <p className="experience-body">{entry.content}</p>
                      <div className="experience-tags">
                        {entry.tour_id ? (
                          <span className="experience-tag">
                            {t('experiences.feedTourLabel')}:{' '}
                            {tours.find((tour) => tour.id === entry.tour_id)?.title ?? entry.tour_id}
                          </span>
                        ) : null}
                        {tripDate ? (
                          <span className="experience-tag">
                            {t('experiences.feedTripMonthLabel')}: {tripDate}
                          </span>
                        ) : null}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  )
}
