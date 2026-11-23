import { getInitials } from '../utils/customerUtils'

export default function CustomerProfile({ customer, size = 40 }) {
  return (
    <span className="customers-profile" style={{ width: size, height: size }}>
      {getInitials(customer?.name ?? 'C')}
    </span>
  )
}
