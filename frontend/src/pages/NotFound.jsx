import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-6 text-center dark:bg-slate-950">
      <div className="glass-card max-w-md p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600 dark:text-cyan-300">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">Page not found</h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">This route is not part of the Cromgen portal.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">Return home</Link>
      </div>
    </main>
  )
}
