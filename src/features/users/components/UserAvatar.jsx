import { getInitials } from '../utils/userUtils'

export default function UserAvatar({ user, size = 32, className = '' }) {
  const initials = getInitials(user.name)
  return (
    <span className={['users-avatar', className].filter(Boolean).join(' ')} style={{ width: size, height: size, fontSize: size / 2 }}>
      {user.profileImage ? <img src={user.profileImage} alt="" /> : initials}
    </span>
  )
}
