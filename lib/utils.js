// lib/utils.js

// Helper to fix URLs - always add https:// if missing
export const getValidUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `https://${url}`
}

// Helper to validate and clean URLs before saving to database
export const cleanUrl = (url) => {
  if (!url) return null
  const trimmed = url.trim()
  if (trimmed === '') return null
  // If it doesn't start with http:// or https://, add https://
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`
  }
  return trimmed
}