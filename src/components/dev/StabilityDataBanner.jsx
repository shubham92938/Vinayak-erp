import { Beaker, X } from 'lucide-react'
import { disableStabilityMode, isStabilityModeEnabled } from '../../core/stabilityMode'
import './stabilityDataBanner.css'

export default function StabilityDataBanner() {
  const active = isStabilityModeEnabled()

  if (!active) return null

  const exitMode = () => {
    disableStabilityMode()
    window.location.href = `${window.location.pathname}${window.location.hash}`
  }

  return (
    <div className="stability-data-banner" role="status">
      <span className="stability-data-banner__icon"><Beaker size={14} aria-hidden="true" /></span>
      <span><strong>Stability test data</strong> — synthetic records are being shown; no real business data is changed.</span>
      <button type="button" onClick={exitMode} aria-label="Exit stability test data mode" title="Exit stability test data mode"><X size={15} aria-hidden="true" /></button>
    </div>
  )
}
