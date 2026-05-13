import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, LogIn } from 'lucide-react'
import { login } from '../utils/auth'

const credentials = {
  admin: ['admin@cromgen.com', 'admin123'],
  vendor: ['vendor@cromgen.com', 'vendor123'],
  staff: ['staff@cromgen.com', 'staff123'],
  user: ['user@cromgen.com', 'user123'],
}

export default function Login() {
  const [role, setRole] = useState('admin')
  const [form, setForm] = useState({ email: credentials.admin[0], password: credentials.admin[1] })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const changeRole = (nextRole) => {
    setRole(nextRole)
    setForm({ email: credentials[nextRole][0], password: credentials[nextRole][1] })
    setError('')
  }

  const submit = (event) => {
    event.preventDefault()
    const user = login({ ...form, role })
    if (!user) return setError('Credentials do not match the selected role.')
    navigate(`/${user.role}`)
  }

  return (
    <main className="grid min-h-screen bg-slate-100 dark:bg-slate-950 lg:grid-cols-[1fr_520px]">
      <section className="relative hidden overflow-hidden bg-slate-950 text-white lg:block">
        <img src="https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1500&q=80" alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/70 to-blue-950/60" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          <Link to="/" className="flex items-center gap-2 text-sm text-slate-200"><ArrowLeft size={17} /> Back to site</Link>
          <div><p className="text-sm uppercase tracking-[0.28em] text-cyan-200">Cromgen</p><h1 className="mt-4 text-5xl font-semibold tracking-normal">Media governance for every team.</h1><p className="mt-5 max-w-lg text-slate-200">Admin, vendor, staff, and user panels share one clean demo data layer.</p></div>
        </div>
      </section>
      <section className="grid place-items-center p-6">
        <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white/70 bg-white/85 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 lg:hidden"><ArrowLeft size={17} /> Back to site</Link>
          <h2 className="text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">Welcome back</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Choose a role and use the sample credentials.</p>
          <div className="mt-6 grid grid-cols-4 gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-white/5">
            {Object.keys(credentials).map((item) => <button key={item} type="button" onClick={() => changeRole(item)} className={`rounded-xl px-3 py-2 text-sm font-semibold capitalize ${role === item ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-cyan-300' : 'text-slate-500'}`}>{item}</button>)}
          </div>
          <div className="mt-6 grid gap-4">
            <label className="field-label">Email<input className="field-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label className="field-label">Password<input className="field-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          </div>
          {error && <p className="mt-4 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">{error}</p>}
          <button className="btn-primary mt-6 w-full justify-center" type="submit"><LogIn size={17} /> Login as {role}</button>
          <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">Sample: {credentials[role][0]} · {credentials[role][1]}</div>
        </form>
      </section>
    </main>
  )
}
