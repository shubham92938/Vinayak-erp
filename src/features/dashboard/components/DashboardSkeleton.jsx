export default function DashboardSkeleton() {
  return (
    <div className="dash-skeleton" role="status" aria-live="polite">
      <span className="visually-hidden">Loading dashboard data</span>

      <div className="dash-skeleton__kpis" aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => (
          <div className="dash-skeleton__kpi" key={index}>
            <span className="dash-skeleton__line dash-skeleton__line--short" />
            <span className="dash-skeleton__line dash-skeleton__line--value" />
            <span className="dash-skeleton__line dash-skeleton__line--meta" />
          </div>
        ))}
      </div>

      <div className="dash-skeleton__charts" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="dash-skeleton__chart" key={index}>
            <span className="dash-skeleton__line dash-skeleton__line--short" />
            <span className="dash-skeleton__line dash-skeleton__line--meta" />
            <div className="dash-skeleton__plot" />
          </div>
        ))}
      </div>

      <div className="dash-skeleton__lower" aria-hidden="true">
        <div className="dash-skeleton__table">
          <span className="dash-skeleton__line dash-skeleton__line--short" />
          {Array.from({ length: 5 }, (_, index) => (
            <span className="dash-skeleton__row" key={index} />
          ))}
        </div>
        <div className="dash-skeleton__table">
          <span className="dash-skeleton__line dash-skeleton__line--short" />
          {Array.from({ length: 5 }, (_, index) => (
            <span className="dash-skeleton__row" key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}
