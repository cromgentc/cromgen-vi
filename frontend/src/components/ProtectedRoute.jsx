import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getCurrentUser } from '../utils/auth'

export default function ProtectedRoute({ allowed }) {
  const user = getCurrentUser()
  const location = useLocation()

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (allowed && !allowed.includes(user.role)) return <Navigate to={`/${user.role}`} replace />
  return <Outlet />
}
