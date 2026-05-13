import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import { seedStorage } from './data/dummyData'
import Landing from './pages/Landing'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import AdminCategories from './pages/admin/Categories'
import AdminDashboard from './pages/admin/Dashboard'
import AdminMediaGallery from './pages/admin/MediaGallery'
import AdminMediaUpload from './pages/admin/MediaUpload'
import AdminPendingApproval from './pages/admin/PendingApproval'
import AdminProfile from './pages/admin/Profile'
import AdminSettings from './pages/admin/Settings'
import AdminStaff from './pages/admin/StaffManagement'
import AdminUsers from './pages/admin/UsersManagement'
import AdminVendors from './pages/admin/VendorsManagement'
import StaffDashboard from './pages/staff/Dashboard'
import StaffMediaGallery from './pages/staff/MediaGallery'
import StaffPendingApproval from './pages/staff/PendingApproval'
import StaffProfile from './pages/staff/Profile'
import StaffSettings from './pages/staff/Settings'
import UserDashboard from './pages/user/Dashboard'
import UserFavorites from './pages/user/Favorites'
import UserMediaGallery from './pages/user/MediaGallery'
import UserMediaUpload from './pages/user/MediaUpload'
import UserProfile from './pages/user/Profile'
import UserSettings from './pages/user/Settings'
import VendorDashboard from './pages/vendor/Dashboard'
import VendorMediaGallery from './pages/vendor/MediaGallery'
import VendorMediaUpload from './pages/vendor/MediaUpload'
import VendorProfile from './pages/vendor/Profile'
import VendorSettings from './pages/vendor/Settings'
import VendorUsersManagement from './pages/vendor/UsersManagement'
import { getCurrentUser } from './utils/auth'

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem('cromgen_theme') || 'light')
  const user = getCurrentUser()

  useEffect(() => {
    localStorage.setItem('cromgen_theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_30%),linear-gradient(135deg,#f8fafc,#eef2ff_45%,#f8fafc)] text-slate-700 dark:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.13),transparent_30%),linear-gradient(135deg,#020617,#0f172a_48%,#111827)] dark:text-slate-300">
      <div className="flex">
        <Sidebar user={user} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="min-w-0 flex-1">
          <Navbar user={user} onMenu={() => setSidebarOpen(true)} theme={theme} setTheme={setTheme} />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  useEffect(() => {
    seedStorage()
    document.documentElement.classList.toggle('dark', (localStorage.getItem('cromgen_theme') || 'light') === 'dark')
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute allowed={['admin']} />}>
          <Route element={<AppShell />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/upload" element={<AdminMediaUpload />} />
            <Route path="/admin/media" element={<AdminMediaGallery />} />
            <Route path="/admin/pending" element={<AdminPendingApproval />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/vendors" element={<AdminVendors />} />
            <Route path="/admin/staff" element={<AdminStaff />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowed={['vendor']} />}>
          <Route element={<AppShell />}>
            <Route path="/vendor" element={<VendorDashboard />} />
            <Route path="/vendor/upload" element={<VendorMediaUpload />} />
            <Route path="/vendor/media" element={<VendorMediaGallery />} />
            <Route path="/vendor/users" element={<VendorUsersManagement />} />
            <Route path="/vendor/profile" element={<VendorProfile />} />
            <Route path="/vendor/settings" element={<VendorSettings />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowed={['staff']} />}>
          <Route element={<AppShell />}>
            <Route path="/staff" element={<StaffDashboard />} />
            <Route path="/staff/media" element={<StaffMediaGallery />} />
            <Route path="/staff/pending" element={<StaffPendingApproval />} />
            <Route path="/staff/profile" element={<StaffProfile />} />
            <Route path="/staff/settings" element={<StaffSettings />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowed={['user']} />}>
          <Route element={<AppShell />}>
            <Route path="/user" element={<UserDashboard />} />
            <Route path="/user/upload" element={<UserMediaUpload />} />
            <Route path="/user/media" element={<UserMediaGallery />} />
            <Route path="/user/favorites" element={<UserFavorites />} />
            <Route path="/user/profile" element={<UserProfile />} />
            <Route path="/user/settings" element={<UserSettings />} />
          </Route>
        </Route>

        <Route path="/dashboard" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
