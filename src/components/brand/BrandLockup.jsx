import './brand.css'

export default function BrandLockup({ compact = false, tone = 'dark', size = 'md', className = '' }) {
  return (
    <span className={['brand-lockup', `brand-lockup--${tone}`, `brand-lockup--${size}`, compact && 'brand-lockup--compact', className].filter(Boolean).join(' ')} aria-label="Vinayak ERP">
      <span className="brand-lockup__mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 11.5 20 29 30 11.5" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m14.2 18.7 5.8-4.1 5.8 4.1" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity=".72" />
        </svg>
      </span>
      <span className="brand-lockup__copy">
        <span className="brand-lockup__name">VINAYAK <strong>ERP</strong></span>
        {!compact && <span className="brand-lockup__tagline">BUILT REAL · BUILT TRUE</span>}
      </span>
    </span>
  )
}
