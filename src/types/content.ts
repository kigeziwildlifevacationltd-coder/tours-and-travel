export type Tour = {
  id: string
  title: string
  duration: string
  country: string
  summary: string
  image: string
  featured?: boolean
}

export type Service = {
  id: string
  name: string
  description: string
  image: string
}

export type Destination = {
  id: string
  name: string
  region: string
  summary: string
  image: string
  highlights: string[]
}
