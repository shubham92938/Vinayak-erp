import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, CardBody } from '../../../components/ui'
import { getCustomerById } from '../../../core/store'
import { formatMoney } from '../utils/customerUtils'
import CustomerDetailsCard from '../components/CustomerDetailsCard'
import CustomerSalesHistory from '../components/CustomerSalesHistory'
import CustomerPaymentHistory from '../components/CustomerPaymentHistory'
import CustomerActivity from '../components/CustomerActivity'
import '../styles/customers.css'

const TABS = ['Overview', 'Sales History', 'Payment History', 'Activity']

export default function CustomerDetailsPage({ customerId: providedCustomerId }) {
  const navigate = useNavigate()
  const { customerId: routeCustomerId } = useParams()
  const customerId = providedCustomerId ?? routeCustomerId
  const [tab, setTab] = useState('Overview')
  const customer = getCustomerById(customerId)

  if (!customer) {
    return (
      <div className="customers-page">
        <p className="customers-empty">Customer not found.</p>
        <Button variant="secondary" onClick={() => navigate('/customers')}>Back to Customers</Button>
      </div>
    )
  }

  return (
    <div className="customers-page">
      <header className="customers-header">
        <div className="customers-header__top">
          <div className="customers-header__text">
            <p className="customers-header__eyebrow"><span aria-hidden="true">#</span> Customer Details</p>
            <h1 className="customers-header__title">{customer.name}</h1>
            <p className="customers-header__description">{customer.code} · Outstanding: {formatMoney(customer.openingBalance)}</p>
          </div>
          <div className="customers-header__actions">
            <Button variant="secondary" onClick={() => navigate('/customers')}>Back to Customers</Button>
          </div>
        </div>

        <div className="customers-tabs" role="tablist">
          {TABS.map((tabName) => (
            <button
              key={tabName}
              type="button"
              role="tab"
              aria-selected={tab === tabName}
              className={['customers-tab', tab === tabName && 'customers-tab--active'].filter(Boolean).join(' ')}
              onClick={() => setTab(tabName)}
            >
              {tabName}
            </button>
          ))}
        </div>
      </header>

      {tab === 'Overview' && (
        <Card className="customers-details-card">
          <CardBody>
            <CustomerDetailsCard customer={customer}>
              <div className="customers-overview-extra">
                <h3>Financial Summary</h3>
                <div className="customers-money-grid">
                  <Stat label="Outstanding Balance" value={formatMoney(customer.openingBalance)} />
                  <Stat label="Credit Limit" value={formatMoney(customer.creditLimit)} />
                </div>
              </div>
            </CustomerDetailsCard>
          </CardBody>
        </Card>
      )}

      {tab === 'Sales History' && <CustomerSalesHistory customerId={customer.id} />}
      {tab === 'Payment History' && <CustomerPaymentHistory customerId={customer.id} />}
      {tab === 'Activity' && <CustomerActivity customerId={customer.id} />}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="customers-stat">
      <span className="customers-stat__label">{label}</span>
      <span className="customers-stat__value mono">{value}</span>
    </div>
  )
}
