import { ArrowUpRight } from 'lucide-react'

export default function StatCard({ label, value, icon: Icon, tone = 'from-sky-500 to-indigo-500' }) {
  return (
    <div className="glass-card group p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">{value}</h3>
        </div>
        <div className={`rounded-2xl bg-gradient-to-br ${tone} p-3 text-white shadow-lg shadow-slate-900/10`}>
          <Icon size={22} />
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-300">
        <ArrowUpRight size={14} />
        Live demo metrics
      </div>
    </div>
  )
}
