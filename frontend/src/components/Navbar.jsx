import { LogOut, Menu, Moon, Search, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../utils/auth'

export default function Navbar({ user, onMenu, theme, setTheme }) {
  const navigate = useNavigate()
  const signOut = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-white/75 px-4 py-3 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button className="icon-btn lg:hidden" onClick={onMenu} aria-label="Open sidebar"><Menu size={19} /></button>
          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-2 shadow-sm dark:border-white/10 dark:bg-white/5 md:flex">
            <Search size={18} className="text-slate-400" />
            <input className="w-72 bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search media, users, categories..." />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 dark:border-white/10 dark:bg-white/5 sm:flex">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-sm font-bold text-white dark:bg-white dark:text-slate-950">{user.avatar}</span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold text-slate-950 dark:text-white">{user.name}</span>
              <span className="block text-xs capitalize text-slate-500 dark:text-slate-400">{user.role}</span>
            </span>
          </div>
          <button className="icon-btn" onClick={signOut} aria-label="Logout"><LogOut size={18} /></button>
        </div>
      </div>
    </header>
  )
}
