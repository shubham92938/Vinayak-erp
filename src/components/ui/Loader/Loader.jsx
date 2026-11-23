import './Loader.css'

function Loader({
  size = 'md',
  label = 'Loading',
  showLabel = false,
  fullPage = false,
  className = '',
}) {
  const loader = (
    <span
      className={['ui-loader', `ui-loader--${size}`, className]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-live="polite"
    >
      <span className="ui-loader__spinner" aria-hidden="true" />
      <span className={showLabel ? 'ui-loader__label' : 'visually-hidden'}>
        {label}
      </span>
    </span>
  )

  if (fullPage) {
    return <div className="ui-loader-page">{loader}</div>
  }

  return loader
}

export default Loader
