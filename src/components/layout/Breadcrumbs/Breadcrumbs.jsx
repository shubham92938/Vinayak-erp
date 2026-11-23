import { ChevronRight, House } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { getBreadcrumbs } from '../../../config/navigation'
import './Breadcrumbs.css'

export default function Breadcrumbs() {
  const { pathname } = useLocation()
  const crumbs = getBreadcrumbs(pathname)

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs__list">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          const isContext = !crumb.current && crumb.kind !== 'home'

          return (
            <li
              key={`${crumb.label}-${index}`}
              className={[
                'breadcrumbs__item',
                isContext && 'breadcrumbs__item--context',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {index > 0 && (
                <ChevronRight
                  className="breadcrumbs__separator"
                  size={12}
                  aria-hidden="true"
                />
              )}

              {crumb.kind === 'home' ? (
                <Link
                  to={crumb.to}
                  className="breadcrumbs__home"
                  aria-label="Home"
                >
                  <House size={14} aria-hidden="true" />
                  <span>Home</span>
                </Link>
              ) : crumb.current || isLast ? (
                <span className="breadcrumbs__current" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <span className="breadcrumbs__context">{crumb.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
