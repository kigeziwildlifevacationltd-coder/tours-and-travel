import { readEnvValueOr } from './env'

export const BUSINESS_NAME = readEnvValueOr(
  import.meta.env.VITE_BUSINESS_NAME,
  'Kigezi Wildlife Vacation Safaris',
)
export const BUSINESS_CONTACT_EMAIL = readEnvValueOr(
  import.meta.env.VITE_BUSINESS_CONTACT_EMAIL,
  'kigeziwildlifevacationltd@gmail.com',
)
export const BUSINESS_CONTACT_EMAIL_SECONDARY = readEnvValueOr(
  import.meta.env.VITE_BUSINESS_CONTACT_EMAIL_SECONDARY,
  '',
)
export const BUSINESS_PHONE_PRIMARY = readEnvValueOr(
  import.meta.env.VITE_BUSINESS_PHONE_PRIMARY,
  '+256772630450',
)
export const BUSINESS_PHONE_SECONDARY = readEnvValueOr(
  import.meta.env.VITE_BUSINESS_PHONE_SECONDARY,
  '+256760228289',
)
export const BUSINESS_PHONE_TERTIARY = readEnvValueOr(
  import.meta.env.VITE_BUSINESS_PHONE_TERTIARY,
  '+256774605726',
)
