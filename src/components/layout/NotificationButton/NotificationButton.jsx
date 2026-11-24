import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../ui'
import { getUnreadNotificationCount } from '../../../core/store'
import './NotificationButton.css'

export default function NotificationButton() {
  const navigate = useNavigate()
  const unread = getUnreadNotificationCount()

  return (
    <div className="notification-button">
      <Button
        variant="ghost"
        iconOnly
        onClick={() => navigate('/notifications')}
        aria-label={`Notifications, ${unread} unread`}
        title="Notifications"
      >
        <Bell size={17} strokeWidth={1.8} aria-hidden="true" />
      </Button>
      <span className="notification-button__dot" aria-hidden="true" />
      {unread > 0 && (
        <span className="notification-button__count" aria-hidden="true">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </div>
  )
}
