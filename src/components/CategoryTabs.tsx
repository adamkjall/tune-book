import { Link, useParams } from 'react-router-dom'
import { CATEGORIES, getDefaultCategory } from '@/utils/categories'

export default function CategoryTabs() {
  const { category = getDefaultCategory().slug } = useParams<{ category?: string }>()

  return (
    <div className="mb-6 flex gap-2 justify-center flex-wrap">
      {CATEGORIES.map(({ id, slug, label }) => (
        <Link
          key={id}
          to={`/${slug}`}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            category === slug
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
