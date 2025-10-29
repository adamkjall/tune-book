import { Link, useParams } from 'react-router-dom'
import type { Category } from '@/types'

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'currently-working', label: 'Currently Working' },
  { value: 'backlog', label: 'Backlog' },
  { value: 'learned', label: 'Learned' }
]

export default function CategoryTabs() {
  const { category = 'currently-working' } = useParams<{ category?: Category }>()

  return (
    <div className="mb-6 flex gap-2 justify-center flex-wrap">
      {CATEGORIES.map(({ value, label }) => (
        <Link
          key={value}
          to={`/${value}`}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            category === value
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  )
}
