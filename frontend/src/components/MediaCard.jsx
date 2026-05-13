import { Check, Download, Edit3, Eye, Heart, Image, Trash2, Video, X } from 'lucide-react'

const statusClass = {
  Approved: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  Pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  Rejected: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
}

export default function MediaCard({ media, onView, onDelete, onApprove, onReject, onEdit, onFavorite, favorite, canDownload }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/10 dark:border-white/10 dark:bg-white/5">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-900">
        <img src={media.thumbnail || media.src} alt={media.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="badge bg-slate-950/75 text-white">{media.type === 'video' ? <Video size={13} /> : <Image size={13} />} {media.type}</span>
          <span className={`badge ${statusClass[media.status]}`}>{media.status}</span>
        </div>
        <span className="absolute bottom-3 left-3 badge bg-white/85 text-slate-700 backdrop-blur">{media.category}</span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-950 dark:text-white">{media.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{media.description}</p>
          </div>
          {onFavorite && <button className={`icon-btn shrink-0 ${favorite ? 'text-rose-500' : ''}`} onClick={() => onFavorite(media.id)} aria-label="Favorite"><Heart size={17} fill={favorite ? 'currentColor' : 'none'} /></button>}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{media.createdAt}</span>
          <span>{media.uploadedBy.name}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn-soft" onClick={() => onView(media)}><Eye size={15} /> View</button>
          {onEdit && media.status === 'Pending' && <button className="btn-soft" onClick={() => onEdit(media)}><Edit3 size={15} /> Edit</button>}
          {canDownload && <a className="btn-soft" href={media.src} download><Download size={15} /> Download</a>}
          {onApprove && media.status !== 'Approved' && <button className="btn-soft text-emerald-600" onClick={() => onApprove(media.id)}><Check size={15} /> Approve</button>}
          {onReject && media.status !== 'Rejected' && <button className="btn-soft text-rose-600" onClick={() => onReject(media.id)}><X size={15} /> Reject</button>}
          {onDelete && <button className="btn-soft text-rose-600" onClick={() => onDelete(media.id)}><Trash2 size={15} /> Delete</button>}
        </div>
      </div>
    </article>
  )
}
