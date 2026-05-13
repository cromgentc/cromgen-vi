import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function Landing() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative min-h-[92vh] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=80" alt="Premium media operation" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/82 to-blue-950/70" />
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 font-black">C</span><span className="font-semibold">Cromgen Media Collection Portal</span></div>
          <Link className="btn-primary" to="/login">Login <ArrowRight size={17} /></Link>
        </nav>
        <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-7xl items-center px-6">
          <div className="max-w-3xl">
            <span className="badge bg-white/10 text-cyan-200"><Sparkles size={14} /> Enterprise media operations</span>
            <h1 className="mt-6 text-5xl font-semibold tracking-normal sm:text-7xl">Cromgen Media Collection Portal</h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-200">A premium image and video collection workspace with admin governance, vendor uploads, staff review, and user-ready approved galleries.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link className="btn-primary" to="/login">Open workspace <ArrowRight size={17} /></Link></div>
          </div>
        </div>
      </section>
    </main>
  )
}
