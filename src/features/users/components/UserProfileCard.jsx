import { Card, CardBody } from '../../../components/ui'
import UserAvatar from './UserAvatar'
import UserStatusBadge from './UserStatusBadge'
import { getFirmLabel, formatUserDate } from '../utils/userUtils'

export default function UserProfileCard({ user, actions }) {
  return (
    <Card className="user-profile-card">
      <CardBody>
        <div className="user-profile-card__head">
          <UserAvatar user={user} size={40} />
          <div className="user-profile-card__details">
            <h3 className="user-profile-card__name">{user.name}</h3>
            <p className="user-profile-card__email">{user.email}</p>
            <div className="user-profile-card__status">
              <UserStatusBadge user={user} />
            </div>
          </div>
          {actions && <div className="user-profile-card__actions">{actions}</div>}
        </div>
        <div className="user-profile-card__meta">
          <div className="user-profile-card__meta-item">
            <span className="user-profile-card__meta-label">Firm</span>
            <span className="user-profile-card__meta-value">{getFirmLabel(user.firmId)}</span>
          </div>
          <div className="user-profile-card__meta-item">
            <span className="user-profile-card__meta-label">Role</span>
            <span className="user-profile-card__meta-value">{user.role}</span>
          </div>
          <div className="user-profile-card__meta-item">
            <span className="user-profile-card__meta-label">Last Login</span>
            <span className="user-profile-card__meta-value">{formatUserDate(user.lastLogin)}</span>
          </div>
          <div className="user-profile-card__meta-item">
            <span className="user-profile-card__meta-label">Created</span>
            <span className="user-profile-card__meta-value">{formatUserDate(user.createdAt)}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
