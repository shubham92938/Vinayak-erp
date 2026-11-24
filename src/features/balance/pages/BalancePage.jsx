import { Card, CardBody } from '../../../components/ui'
import { mockAccounts, formatMoney } from '../../../core/store'
import { Badge } from '../../../components/ui'
import '../styles/balance.css'

const ACCOUNT_VARIANTS = {
  Cash: 'neutral',
  Bank: 'info',
}

export default function BalancePage() {
  const accounts = mockAccounts.slice().sort((a, b) => a.balance - b.balance)
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  return (
    <div className="balance-page">
      <header className="balance-header">
        <div className="balance-header__top">
          <div className="balance-header__text">
            <p className="balance-header__eyebrow"><span aria-hidden="true">#</span> Balance</p>
            <h1 className="balance-header__title">Account Balances</h1>
            <p className="balance-header__description">
              Cash, bank accounts and other configured accounts with current balances. Demo data.
            </p>
          </div>
        </div>
        <div className="balance-kpi-grid">
          <div className="balance-kpi-card">
            <span className="balance-kpi-card__label">Total Balance (All Accounts)</span>
            <span className="balance-kpi-card__value">{formatMoney(totalBalance)}</span>
          </div>
        </div>
      </header>

      <Card className="balance-card">
        <CardBody>
          <h3 className="balance-card__title">Accounts</h3>
          <table className="balance-table">
            <thead>
              <tr><th>Account Name</th><th>Type</th><th className="align-right">Opening Balance</th><th className="align-right">Total Debit</th><th className="align-right">Total Credit</th><th className="align-right">Current Balance</th></tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className={account.balance < 0 ? 'balance-row--negative' : ''}>
                  <td>{account.name}</td>
                  <td>
                    <Badge variant={ACCOUNT_VARIANTS[account.type] ?? 'neutral'} size="sm">{account.type}</Badge>
                  </td>
                  <td className="align-right">{formatMoney(account.openingBalance)}</td>
                  <td className="align-right">—</td>
                  <td className="align-right">—</td>
                  <td className="align-right">{formatMoney(account.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  )
}
