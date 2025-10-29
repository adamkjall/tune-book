export interface CategoryConfig {
  id: string; // Stable ID - stored in database, never change this
  slug: string; // URL-friendly slug - can be changed if needed
  label: string; // Display name - change freely anytime
}

export const CATEGORIES: CategoryConfig[] = [
  { 
    id: 'currently-working',
    slug: 'currently-working',
    label: 'Currently Working'
  },
  { 
    id: 'backlog',
    slug: 'backlog',
    label: 'Backlog'
  },
  { 
    id: 'learned',
    slug: 'learned',
    label: 'Learned'
  }
]

// Helper functions for category lookups
export const getCategoryById = (id: string) => 
  CATEGORIES.find(c => c.id === id)

export const getCategoryBySlug = (slug: string) => 
  CATEGORIES.find(c => c.slug === slug)

export const getDefaultCategory = () => CATEGORIES[0]

// Type helper for category IDs (for type safety)
export type CategoryId = typeof CATEGORIES[number]['id']
