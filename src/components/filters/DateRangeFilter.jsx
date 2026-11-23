import Input from '../ui/Input/Input'
import Select from '../ui/Select/Select'
import './filters.css'
import {
  DATE_RANGE_PRESETS,
  EMPTY_DATE_RANGE,
  resolvePresetRange,
} from './datePresets'

function DateRangeFilter({
  value = EMPTY_DATE_RANGE,
  onChange,
  label = 'Date range',
  presets = DATE_RANGE_PRESETS,
  referenceDate = new Date(),
  min,
  max,
  className = '',
}) {
  const current = value ?? EMPTY_DATE_RANGE
  const showCustom = current.preset === 'custom'

  const handlePresetChange = (event) => {
    const nextPreset = event.target.value

    if (nextPreset === 'custom') {
      onChange?.({
        preset: 'custom',
        start: current.start,
        end: current.end,
      })
      return
    }

    onChange?.({
      preset: nextPreset,
      ...resolvePresetRange(nextPreset, referenceDate),
    })
  }

  const handleStartChange = (event) => {
    const nextStart = event.target.value
    const nextEnd =
      current.end && nextStart && nextStart > current.end
        ? nextStart
        : current.end

    onChange?.({ preset: 'custom', start: nextStart, end: nextEnd })
  }

  const handleEndChange = (event) => {
    const nextEnd = event.target.value
    const nextStart =
      current.start && nextEnd && nextEnd < current.start
        ? nextEnd
        : current.start

    onChange?.({ preset: 'custom', start: nextStart, end: nextEnd })
  }

  return (
    <div
      className={['date-range-filter', className].filter(Boolean).join(' ')}
    >
      <Select
        label={label}
        size="sm"
        options={presets}
        value={current.preset || 'all'}
        onChange={handlePresetChange}
        placeholder=""
        containerClassName="date-range-filter__preset"
        aria-label={label}
      />

      {showCustom && (
        <div className="date-range-filter__custom">
          <Input
            label="From"
            type="date"
            size="sm"
            value={current.start}
            min={min}
            max={current.end || max}
            onChange={handleStartChange}
            containerClassName="date-range-filter__date"
          />
          <Input
            label="To"
            type="date"
            size="sm"
            value={current.end}
            min={current.start || min}
            max={max}
            onChange={handleEndChange}
            containerClassName="date-range-filter__date"
          />
        </div>
      )}
    </div>
  )
}

export default DateRangeFilter
