import {
  CalendarRange,
  CheckCircle2,
  Download,
  RefreshCw,
} from 'lucide-react'
import { Badge, Button, Loader } from '../../../components/ui'
import { formatDateTimeLabel } from '../utils/dateRange'
import DashboardFilters from './DashboardFilters'
import './DashboardHeader.css'

export default function DashboardHeader({
  filters,
  onChange,
  onReset,
  canReset,
  financialYearOptions,
  firms,
  minDate,
  maxDate,
  rangeLabel,
  previousRangeLabel,
  lastUpdated,
  loading,
  refreshing,
  refreshDisabled,
  exportDisabled,
  onRefresh,
  onExport,
  exportCount,
  demoLabel,
  demoNotice,
  canViewAllFirms,
}) {
  return (
    <header className="dash-header">
      <div className="dash-header__top">
        <div className="dash-header__intro">
          <div className="dash-header__eyebrow">
            <Badge variant="warning" size="sm" dot title={demoNotice}>
              {demoLabel}
            </Badge>
            <span>Business overview</span>
          </div>

          <h1 className="page-title">Dashboard</h1>
          <p className="dash-header__description">
            Monitor your business performance and operations.
          </p>
        </div>

        <div className="dash-header__actions">
          <Button
            variant="secondary"
            leadingIcon={<RefreshCw size={15} />}
            onClick={onRefresh}
            loading={refreshing}
            disabled={refreshing || refreshDisabled}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            leadingIcon={<Download size={15} />}
            onClick={onExport}
            disabled={exportDisabled}
            title={`Export ${exportCount} filtered transaction${
              exportCount === 1 ? '' : 's'
            } as CSV`}
          >
            Export
          </Button>
        </div>
      </div>

      <DashboardFilters
        filters={filters}
        onChange={onChange}
        onReset={onReset}
        canReset={canReset}
        financialYearOptions={financialYearOptions}
        firms={firms}
        canViewAllFirms={canViewAllFirms}
        minDate={minDate}
        maxDate={maxDate}
      />

      <div className="dash-header__meta">
        <p className="dash-header__period">
          <CalendarRange size={14} aria-hidden="true" />
          <span>
            {rangeLabel}
            {previousRangeLabel && (
              <span className="dash-header__comparison">
                {' '}
                · compared with {previousRangeLabel}
              </span>
            )}
          </span>
        </p>

        <p className="dash-header__updated" aria-live="polite">
          {loading ? (
            <Loader size="sm" showLabel label="Updating dashboard" />
          ) : lastUpdated ? (
            <>
              <CheckCircle2 size={13} aria-hidden="true" />
              Updated {formatDateTimeLabel(lastUpdated)}
            </>
          ) : (
            'Waiting for data'
          )}
        </p>
      </div>
    </header>
  )
}
