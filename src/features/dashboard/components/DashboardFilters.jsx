import { RotateCcw } from 'lucide-react'
import { Button, Input, Select } from '../../../components/ui'
import { DATE_PRESETS } from '../utils/dateRange'
import './DashboardFilters.css'

export default function DashboardFilters({
  filters,
  onChange,
  onReset,
  financialYearOptions,
  firms,
  minDate,
  maxDate,
  canReset,
}) {
  const firmOptions = [
    { value: 'all', label: 'All firms' },
    ...firms.map((firm) => ({
      value: firm.id,
      label: `${firm.name} · ${firm.location}`,
    })),
  ]

  return (
    <div className="dash-filters">
      <div className="dash-filters__group">
        <Select
          label="Date range"
          size="md"
          options={DATE_PRESETS}
          value={filters.preset}
          onChange={(event) => onChange({ preset: event.target.value })}
          placeholder=""
          containerClassName="dash-filters__field dash-filters__field--period"
          aria-label="Date range preset"
        />

        {filters.preset === 'custom' && (
          <div className="dash-filters__custom">
            <Input
              label="From"
              type="date"
              size="md"
              value={filters.customStart}
              min={minDate}
              max={filters.customEnd}
              onChange={(event) =>
                onChange({ customStart: event.target.value })
              }
              containerClassName="dash-filters__field dash-filters__field--date"
            />
            <Input
              label="To"
              type="date"
              size="md"
              value={filters.customEnd}
              min={filters.customStart}
              max={maxDate}
              onChange={(event) =>
                onChange({ customEnd: event.target.value })
              }
              containerClassName="dash-filters__field dash-filters__field--date"
            />
          </div>
        )}

        <Select
          label="Financial year"
          size="md"
          options={financialYearOptions}
          value={filters.financialYear}
          onChange={(event) =>
            onChange({ financialYear: event.target.value })
          }
          placeholder=""
          containerClassName="dash-filters__field dash-filters__field--fiscal"
          aria-label="Financial year"
        />

        <Select
          label="Firm"
          size="md"
          options={firmOptions}
          value={filters.firmId}
          onChange={(event) => onChange({ firmId: event.target.value })}
          placeholder=""
          containerClassName="dash-filters__field dash-filters__field--firm"
          aria-label="Firm"
        />
      </div>

      <div className="dash-filters__actions">
        <Button
          variant="ghost"
          size="sm"
          leadingIcon={<RotateCcw size={14} />}
          onClick={onReset}
          disabled={!canReset}
          className="dash-filters__reset"
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
