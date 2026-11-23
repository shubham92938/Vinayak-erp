import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'
import './PlaceholderPage.css'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <div className="page not-found">
      <div className="not-found__panel">
        <span className="not-found__icon" aria-hidden="true">
          <Compass size={20} strokeWidth={1.7} />
        </span>

        <p className="page-eyebrow">Error 404</p>
        <h1 className="page-title">Page not found</h1>
        <p className="not-found__description">
          The page you requested is not part of this workspace. Check the
          address or return to the overview.
        </p>

        <div className="not-found__actions">
          <Link
            to="/dashboard"
            className="ui-button ui-button--primary ui-button--md"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            <span className="ui-button__label">Back to overview</span>
          </Link>
          <Link
            to="/design-system"
            className="ui-button ui-button--secondary ui-button--md"
          >
            <span className="ui-button__label">Design system</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
