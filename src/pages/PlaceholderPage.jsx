import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, CircleDashed } from 'lucide-react'
import { Badge, Card, CardBody, CardFooter } from '../components/ui'
import { getRouteMeta } from '../config/navigation'
import './PlaceholderPage.css'

function getDescription(title, section) {
  if (section === 'Overview') {
    return 'The operational overview arrives in the next build. The shell, navigation, and route are already in place.'
  }

  return `The ${title} workflow is scaffolded. Data entry, tables, and module actions will be added in a later step.`
}

export default function PlaceholderPage() {
  const { pathname } = useLocation()
  const meta = getRouteMeta(pathname)
  const title = meta?.title ?? meta?.label ?? 'Workspace module'
  const section = meta?.section ?? 'Workspace'

  return (
    <div className="page placeholder-page">
      <header className="page-header">
        <div className="page-header__text">
          <p className="page-eyebrow">
            {section}
            {meta?.parent ? ` / ${meta.parent}` : ''}
          </p>
          <h1 className="page-title">{title}</h1>
          <p className="page-description">{getDescription(title, section)}</p>
        </div>

        <div className="page-header__actions">
          <Badge variant="neutral" dot>
            Placeholder
          </Badge>
        </div>
      </header>

      <Card className="placeholder-card">
        <CardBody className="placeholder-card__body">
          <span className="placeholder-card__icon" aria-hidden="true">
            <CircleDashed size={20} strokeWidth={1.7} />
          </span>

          <div className="placeholder-card__copy">
            <h2 className="placeholder-card__title">
              This module is ready for its workflow
            </h2>
            <p className="placeholder-card__description">
              The route, breadcrumb, and navigation entry are live. Forms,
              records, and data views for {title} will be built on this
              foundation.
            </p>
          </div>
        </CardBody>

        <CardFooter className="placeholder-card__footer">
          <div className="placeholder-card__route">
            <span>Route</span>
            <code>{pathname}</code>
          </div>

          <Link to="/dashboard" className="ui-button ui-button--secondary ui-button--md">
            <ArrowLeft size={15} aria-hidden="true" />
            <span className="ui-button__label">Return to overview</span>
          </Link>
        </CardFooter>
      </Card>

      <p className="placeholder-page__note">
        Looking for the component foundation?{' '}
        <Link to="/design-system">Open the design system</Link>.
      </p>
    </div>
  )
}
