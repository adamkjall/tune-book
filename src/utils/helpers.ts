// Utility functions for the Guitar Learning Tracker

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString()
}

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const getProgressColor = (progress: number): string => {
  if (progress < 30) return 'text-red-400'
  if (progress < 70) return 'text-yellow-400'
  return 'text-green-400'
}
