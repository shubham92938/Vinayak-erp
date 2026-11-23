import { Badge, Card, CardBody } from '../../../components/ui'
import { formatDate, formatMoney, getFirmLabel } from '../utils/customerUtils'

const DetailRow = ({ label, value, mono }) => (
  <div className="customers-detail-row">
    <span className="customers-detail-label">{label}</span>
    <span className={`customers-detail-value ${mono ? 'mono' : ''}`}>{value}</span>
  </div>
)

export default function CustomerDetailsCard({ customer, children }) {
  const s = customer

  return (
    <Card className="customers-detail-card">
      <CardBody>
        <div className="customers-detail-head">
          <div className="customers-detail-head-text">
            <p className="customers-detail-title">{s.name}</p>
            <p className="customers-detail-code">{s.code}</p>
          </div>
          <Badge variant={s.status === 'Active' ? 'success' : 'neutral'} size="sm">
            {s.status}
          </Badge>
        </div>

        <div className="customers-detail-grid">
          <DetailRow label="Customer Type" value={<Badge variant="info" size="sm">{s.customerType}</Badge>} />
          <DetailRow label="Contact Person" value={s.contactPerson} />
          <DetailRow label="Phone" value={s.phone} />
          <DetailRow label="Alternate Phone" value={s.alternatePhone} />
          <DetailRow label="Email" value={s.email} mono />
          <DetailRow label="GST Number" value={s.gst} mono />
          <DetailRow label="PAN Number" value={s.pan} mono />
          <DetailRow label="Firm" value={getFirmLabel(s.firmId)} />
          <DetailRow label="Credit Limit" value={formatMoney(s.creditLimit)} />
          <DetailRow label="Outstanding Balance" value={formatMoney(s.openingBalance)} mono />
          <DetailRow label="Payment Terms" value={s.paymentTerms} />
          <DetailRow label="Created" value={formatDate(s.createdAt)} />
        </div>

        <div className="customers-detail-address">
          <DetailRow label="Billing Address" value={s.address} />
          <DetailRow label="Shipping Address" value={s.shippingAddress} />
          <DetailRow label="City" value={`${s.city}${s.state ? `, ${s.state}` : ''} ${s.pinCode}`} />
        </div>

        {children && <div className="customers-detail-extra">{children}</div>}
      </CardBody>
    </Card>
  )
}
