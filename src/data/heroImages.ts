const heroImageModules = import.meta.glob('../assets/hero/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
})

const heroBackgroundImages = Object.entries(heroImageModules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, src]) => src as string)

export { heroBackgroundImages }
