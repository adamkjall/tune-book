# Category Management Guide

This app uses a centralized category configuration system that makes it easy to change category names and URLs without breaking existing data.

## How It Works

Categories are defined in `/src/utils/categories.ts` with three properties:

1. **`id`** - Stable identifier stored in the database (NEVER change this)
2. **`slug`** - URL-friendly string used in routes (can be changed if needed)
3. **`label`** - Display name shown to users (change freely anytime!)

## How to Change Category Names

### ✅ Easy: Change Display Names

To change what users see, just update the `label` field:

```typescript
{ 
  id: 'currently-working',
  slug: 'currently-working',
  label: 'In Progress'  // Changed from 'Currently Working'
}
```

✅ **Safe** - No data migration needed, works immediately

### ⚠️ Medium: Change URL Slugs

To change the URL (e.g., `/currently-working` → `/in-progress`):

```typescript
{ 
  id: 'currently-working',  // Keep this the same!
  slug: 'in-progress',       // Changed
  label: 'In Progress'
}
```

⚠️ **Caution** - Old bookmarks/links will break, but data is safe

### 🚫 Never: Change IDs

**DO NOT** change the `id` field - it's stored in the database for all songs!

```typescript
{ 
  id: 'currently-working',  // ❌ NEVER CHANGE THIS
  slug: 'currently-working',
  label: 'Currently Working'
}
```

🚫 Changing IDs will break the connection between songs and categories

## Adding a New Category

Add a new entry to the `CATEGORIES` array:

```typescript
export const CATEGORIES: CategoryConfig[] = [
  { id: 'currently-working', slug: 'currently-working', label: 'Currently Working' },
  { id: 'backlog', slug: 'backlog', label: 'Backlog' },
  { id: 'learned', slug: 'learned', label: 'Learned' },
  { id: 'wishlist', slug: 'wishlist', label: 'Wishlist' }  // New!
]
```

## Deleting a Category

1. Remove the category from the `CATEGORIES` array
2. Reassign or delete all songs in that category first to avoid orphaned data

## Current Categories

Check `/src/utils/categories.ts` to see your current configuration.
