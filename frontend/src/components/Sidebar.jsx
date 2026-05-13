import { Link, useLocation } from 'react-router-dom'
import { BarChart3, FolderOpen, Heart, Home, ImagePlus, LayoutDashboard, ListChecks, Settings, ShieldCheck, Tags, Users, X } from 'lucide-react'

const navByRole = {
  admin: [
    ['Dashboard', '/admin', LayoutDashboard],
    ['Upload Media', '/admin/upload', ImagePlus],
    ['Media Gallery', '/admin/media', FolderOpen],
    ['Pending Approval', '/admin/pending', ListChecks],
    ['Users', '/admin/users', Users],
    ['Vendors', '/admin/vendors', ShieldCheck],
    ['Staff', '/admin/staff', BarChart3],
    ['Categories', '/admin/categories', Tags],
    ['Settings', '/admin/settings', Settings],
  ],
  vendor: [
    ['Dashboard', '/vendor', LayoutDashboard],
    ['Upload Media', '/vendor/upload', ImagePlus],
    ['My Media', '/vendor/media', FolderOpen],
    ['Create Users', '/vendor/users', Users],
    ['Profile', '/vendor/profile', Users],
    ['Settings', '/vendor/settings', Settings],
  ],
  staff: [
    ['Dashboard', '/staff', LayoutDashboard],
    ['Review Uploads', '/staff/media', ListChecks],
    ['Pending Approval', '/staff/pending', ShieldCheck],
    ['Profile', '/staff/profile', Users],
    ['Settings', '/staff/settings', Settings],
  ],
  user: [
    ['Dashboard', '/user', LayoutDashboard],
    ['Upload Media', '/user/upload', ImagePlus],
    ['Gallery', '/user/media', FolderOpen],
    ['Favorites', '/user/favorites', Heart],
    ['Profile', '/user/profile', Users],
    ['Settings', '/user/settings', Settings],
  ],
}

export default function Sidebar({ user, open, onClose }) {
  const { pathname } = useLocation()
  const items = navByRole[user.role] || []

  return (
    <>
      <div className={`fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden ${open ? 'block' : 'hidden'}`} onClick={onClose} />
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/60 bg-white/85 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl transition-transform duration-300 dark:border-white/10 dark:bg-slate-950/80 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between gap-3 px-2 py-3">
          <Link to="/" className="flex items-center gap-3" onClick={onClose}>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-fuchsia-600 text-lg font-black text-white shadow-lg">C</span>
            <span>
              <span className="block text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Cromgen</span>
              <span className="block text-lg font-bold text-slate-950 dark:text-white">Media Portal</span>
            </span>
          </Link>
          <button className="icon-btn lg:hidden" onClick={onClose} aria-label="Close sidebar"><X size={18} /></button>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-1">
          <Link to="/" className="sidebar-link" onClick={onClose}><Home size={18} /> Public Website</Link>
          {items.map(([label, href, Icon]) => {
            const active = pathname === href
            return (
              <Link key={href} to={href} onClick={onClose} className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}>
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="rounded-2xl border border-white/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Signed in as</p>
          <p className="mt-2 font-semibold text-slate-950 dark:text-white">{user.name}</p>
          <p className="text-sm capitalize text-slate-500 dark:text-slate-400">{user.role} workspace</p>
        </div>
      </aside>
    </>
  )
}
