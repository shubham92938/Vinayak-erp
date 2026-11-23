import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../ui'
import './NotificationButton.css'

export default function NotificationButton() {
  const navigate = useNavigate()

  return (
    <div className="notification-button">
      <Button
        variant="ghost"
        iconOnly
        onClick={() => navigate('/notifications')}
        aria-label="Notifications, 3 unread"
        title="Notifications"
      >
        <Bell size={17} strokeWidth={1.8} aria-hidden="true" />
      </Button>
      <span className="notification-button__dot" aria-hidden="true" />
    </div>
  )
}
