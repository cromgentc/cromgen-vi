import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Cloud, Clock3, FolderOpen, Image, Save, Search, ShieldCheck, Tags, UploadCloud, Users, Video, XCircle } from 'lucide-react'
import MediaCard from '../components/MediaCard'
import MediaModal from '../components/MediaModal'
import StatCard from '../components/StatCard'
import UploadBox from '../components/UploadBox'
import { deleteMedia, getCurrentUser, store, updateMedia, upsertUser } from '../utils/auth'

const roleTitles = {
  admin: 'Command Center',
  vendor: 'Vendor Studio',
  staff: 'Review Desk',
  user: 'Collection Library',
}

function usePortalData() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const refresh = () => setTick((value) => value + 1)
    window.addEventListener('cromgen-storage', refresh)
    return () => window.removeEventListener('cromgen-storage', refresh)
  }, [])
  return {
    tick,
    user: getCurrentUser(),
    users: store.users(),
    media: store.media(),
    categories: store.categories(),
    favorites: store.favorites(),
  }
}

const mediaForRole = (media, user) => {
  if (user.role === 'vendor') return media.filter((item) => item.uploadedBy.id === user.id)
  if (user.role === 'staff') return media.filter((item) => item.assignedTo === user.id || item.status !== 'Approved')
  if (user.role === 'user') return media.filter((item) => item.status === 'Approved' || item.uploadedBy.id === user.id)
  return media
}

export function DashboardPage({ role }) {
  const { user, users, media } = usePortalData()
  const scoped = mediaForRole(media, user)
  const stats = [
    ['Total media', scoped.length, FolderOpen, 'from-cyan-500 to-blue-600'],
    ['Total images', scoped.filter((item) => item.type === 'image').length, Image, 'from-emerald-500 to-teal-600'],
    ['Total videos', scoped.filter((item) => item.type === 'video').length, Video, 'from-violet-500 to-fuchsia-600'],
    ['Pending review', scoped.filter((item) => item.status === 'Pending').length, Clock3, 'from-amber-500 to-orange-600'],
  ]

  if (role === 'admin') {
    stats.push(['Vendors', users.filter((item) => item.role === 'vendor').length, ShieldCheck, 'from-blue-500 to-indigo-600'])
    stats.push(['Staff', users.filter((item) => item.role === 'staff').length, Users, 'from-slate-600 to-slate-900'])
    stats.push(['Users', users.filter((item) => item.role === 'user').length, Users, 'from-rose-500 to-pink-600'])
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={user.role}
        title={roleTitles[role]}
        text="Monitor media operations, approvals, and access from a polished localStorage demo workspace."
        action={['admin', 'vendor', 'user'].includes(role) ? <Link to={`/${role}/upload`} className="btn-primary"><UploadCloud size={17} /> Upload media</Link> : null}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, Icon, tone]) => <StatCard key={label} label={label} value={value} icon={Icon} tone={tone} />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Recent media flow</h2>
            <Link to={`/${role}/media`} className="text-sm font-medium text-blue-600 dark:text-cyan-300">Open gallery</Link>
          </div>
          <div className="mt-5 space-y-3">
            {scoped.slice(0, 5).map((item) => <ActivityRow key={item.id} item={item} />)}
          </div>
        </div>
        <div className="glass-card p-5">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Approval health</h2>
          <div className="mt-5 grid gap-3">
            <MiniMetric icon={CheckCircle2} label="Approved" value={scoped.filter((item) => item.status === 'Approved').length} />
            <MiniMetric icon={Clock3} label="Pending" value={scoped.filter((item) => item.status === 'Pending').length} />
            <MiniMetric icon={XCircle} label="Rejected" value={scoped.filter((item) => item.status === 'Rejected').length} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ActivityRow({ item }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5">
      <img src={item.thumbnail} alt="" className="h-14 w-16 rounded-xl object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-950 dark:text-white">{item.title}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{item.category} · {item.uploadedBy.name}</p>
      </div>
      <span className="badge bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300">{item.status}</span>
    </div>
  )
}

function MiniMetric({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-100/80 p-4 dark:bg-white/5">
      <span className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300"><Icon size={18} /> {label}</span>
      <span className="text-xl font-semibold text-slate-950 dark:text-white">{value}</span>
    </div>
  )
}

export function UploadPage() {
  const { user, categories } = usePortalData()
  const [toast, setToast] = useState('')
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Media upload" title="Create a new collection asset" text="Capture a photo from camera, or directly upload image/video files into the approval workflow." />
      {toast && <Toast text={toast} onClose={() => setToast('')} />}
      <UploadBox user={user} categories={categories} onUploaded={setToast} />
    </div>
  )
}

export function GalleryPage({ mode = 'all', favoritesOnly = false }) {
  const { user, media, categories, favorites } = usePortalData()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [category, setCategory] = useState('all')
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState('')
  const scoped = mode === 'pending' ? mediaForRole(media, user).filter((item) => item.status === 'Pending') : mediaForRole(media, user)
  const filtered = scoped.filter((item) => {
    const matchesFavorite = !favoritesOnly || favorites.includes(item.id)
    const matchesType = type === 'all' || item.type === type
    const matchesCategory = category === 'all' || item.category === category
    const matchesQuery = [item.title, item.description, item.category, item.uploadedBy.name].join(' ').toLowerCase().includes(query.toLowerCase())
    return matchesFavorite && matchesType && matchesCategory && matchesQuery
  })

  const approve = (id) => { updateMedia(id, { status: 'Approved', remarks: 'Approved from review queue.' }); setToast('Media approved.') }
  const reject = (id) => { updateMedia(id, { status: 'Rejected', remarks: 'Rejected. Please revise and resubmit.' }); setToast('Media rejected with remarks.') }
  const remove = (id) => { deleteMedia(id); setToast('Media deleted.') }
  const favorite = (id) => {
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id]
    store.setFavorites(next)
  }
  const canApprove = ['admin', 'staff'].includes(user.role)
  const canDownload = user.role !== 'vendor'
  const canDelete = user.role === 'admin'

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={mode === 'pending' ? 'Approval queue' : 'Media gallery'} title={favoritesOnly ? 'Favorite Media' : mode === 'pending' ? 'Pending Approval' : 'Collection Gallery'} text="Search, filter, preview, approve, reject, download, favorite, and manage assets." />
      {toast && <Toast text={toast} onClose={() => setToast('')} />}
      <div className="glass-card grid gap-3 p-4 md:grid-cols-[1fr_170px_210px]">
        <label className="flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3 dark:bg-white/5"><Search size={18} className="text-slate-400" /><input className="w-full bg-transparent text-sm outline-none" placeholder="Search media..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <select className="field-input" value={type} onChange={(event) => setType(event.target.value)}><option value="all">All types</option><option value="image">Images</option><option value="video">Videos</option></select>
        <select className="field-input" value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((item) => <option key={item.id}>{item.name}</option>)}</select>
      </div>
      {filtered.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <MediaCard
              key={item.id}
              media={item}
              onView={setSelected}
              onDelete={canDelete || (['vendor', 'user'].includes(user.role) && item.uploadedBy.id === user.id && item.status === 'Pending') ? remove : null}
              onApprove={canApprove ? approve : null}
              onReject={canApprove ? reject : null}
              onFavorite={user.role === 'user' ? favorite : null}
              favorite={favorites.includes(item.id)}
              canDownload={canDownload}
            />
          ))}
        </div>
      ) : <EmptyState title="No media found" text="Try a different search, filter, or upload a fresh asset." />}
      <MediaModal media={selected} onClose={() => setSelected(null)} canDownload={canDownload} showDeviceInfo={user.role === 'admin'} />
    </div>
  )
}

export function ManagementPage({ role }) {
  const { user, users } = usePortalData()
  const [form, setForm] = useState({ name: '', email: '', password: 'demo123', role, permission: role === 'user' ? 'Can download' : role === 'staff' ? 'Can approve' : 'Upload media', phone: '' })
  const [toast, setToast] = useState('')
  const items = users.filter((item) => item.role === role)

  const submit = (event) => {
    event.preventDefault()
    upsertUser(form)
    setForm({ ...form, name: '', email: '', phone: '' })
    setToast(`${role[0].toUpperCase() + role.slice(1)} account created.`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account management"
        title={user.role === 'vendor' && role === 'user' ? 'Create User Accounts' : `${role[0].toUpperCase() + role.slice(1)} Management`}
        text={user.role === 'vendor' && role === 'user' ? 'Create customer user accounts from the vendor workspace.' : 'Create demo accounts and review current access for this role.'}
      />
      {toast && <Toast text={toast} onClose={() => setToast('')} />}
      <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
        <form onSubmit={submit} className="glass-card p-5">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Create account</h2>
          <div className="mt-5 grid gap-4">
            <label className="field-label">Name<input className="field-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label className="field-label">Email<input className="field-input" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label className="field-label">Password<input className="field-input" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
            <label className="field-label">Phone<input className="field-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          </div>
          <button className="btn-primary mt-5" type="submit"><Users size={17} /> Create account</button>
        </form>
        <DataTable items={items} />
      </div>
    </div>
  )
}

function DataTable({ items }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-slate-200/80 bg-slate-50/80 text-xs uppercase tracking-[0.14em] text-slate-500 dark:border-white/10 dark:bg-white/5">
            <tr><th className="px-5 py-4">Name</th><th className="px-5 py-4">Email</th><th className="px-5 py-4">Permission</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Joined</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
            {items.map((item) => <tr key={item.id} className="text-slate-700 dark:text-slate-300"><td className="px-5 py-4 font-semibold text-slate-950 dark:text-white">{item.name}</td><td className="px-5 py-4">{item.email}</td><td className="px-5 py-4">{item.permission}</td><td className="px-5 py-4"><span className="badge bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">{item.status}</span></td><td className="px-5 py-4">{item.joined}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function CategoriesPage() {
  const { categories } = usePortalData()
  const [name, setName] = useState('')
  const add = (event) => {
    event.preventDefault()
    if (!name.trim()) return
    store.setCategories([{ id: `cat-${crypto.randomUUID()}`, name, description: 'Custom local category', active: true }, ...categories])
    setName('')
  }
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Taxonomy" title="Category Management" text="Keep the collection searchable with a clean content taxonomy." />
      <form onSubmit={add} className="glass-card flex flex-col gap-3 p-4 sm:flex-row"><input className="field-input flex-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name" /><button className="btn-primary"><Tags size={17} /> Add category</button></form>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((item) => <div key={item.id} className="glass-card p-5"><span className="badge bg-blue-500/15 text-blue-700 dark:text-cyan-300">Active</span><h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{item.name}</h3><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.description}</p></div>)}
      </div>
    </div>
  )
}

export function ProfilePage() {
  const { user } = usePortalData()
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Profile" title="Account Profile" text="Role, permissions, and demo identity details for the active account." />
      <div className="glass-card p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <span className="grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-cyan-500 to-fuchsia-600 text-3xl font-black text-white">{user.avatar}</span>
          <div>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">{user.name}</h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">{user.email}</p>
            <div className="mt-4 flex flex-wrap gap-2"><span className="badge bg-slate-950 text-white capitalize">{user.role}</span><span className="badge bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">{user.permission}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SettingsPage() {
  const [cloudinary, setCloudinary] = useState(() => JSON.parse(localStorage.getItem('cromgen_cloudinary_settings') || '{"cloudName":"","apiKey":"","apiSecret":"","folder":"cromgen-media"}'))
  const [uploadLimit, setUploadLimit] = useState(() => localStorage.getItem('cromgen_max_file_size_mb') || '60')
  const [toast, setToast] = useState('')

  const saveCloudinary = (event) => {
    event.preventDefault()
    localStorage.setItem('cromgen_cloudinary_settings', JSON.stringify(cloudinary))
    setToast('Cloudinary settings saved for this demo workspace.')
  }

  const saveUploadLimit = (event) => {
    event.preventDefault()
    localStorage.setItem('cromgen_max_file_size_mb', uploadLimit)
    setToast(`Max file size saved as ${uploadLimit} MB for this demo workspace.`)
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Preferences" title="Settings" text="Demo controls for appearance, notifications, download policy, review workflow, and Cloudinary media storage." />
      {toast && <Toast text={toast} onClose={() => setToast('')} />}
      <div className="grid gap-4 md:grid-cols-2">
        {['Email notifications', 'Download permission checks', 'Staff approval workflow', 'Compact gallery cards'].map((item, index) => (
          <label key={item} className="glass-card flex items-center justify-between p-5 text-slate-700 dark:text-slate-200">
            <span>{item}</span>
            <input type="checkbox" defaultChecked={index !== 3} className="h-5 w-5 accent-blue-600" />
          </label>
        ))}
      </div>
      <form onSubmit={saveUploadLimit} className="glass-card p-6">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Upload Limits</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Set the demo max image/video upload size shown in the app.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <label className="field-label">
            Max file size (MB)
            <input className="field-input" min="1" max="500" type="number" value={uploadLimit} onChange={(event) => setUploadLimit(event.target.value)} />
          </label>
          <button className="btn-primary" type="submit"><Save size={17} /> Save limit</button>
        </div>
        <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
          Backend live limit comes from `backend/.env` as `MAX_FILE_SIZE_MB=60`. Update that value and restart backend for API uploads.
        </div>
      </form>
      <form onSubmit={saveCloudinary} className="glass-card p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
            <Cloud size={22} />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Cloudinary API</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Backend uploads image/video files to Cloudinary when these environment keys are configured.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="field-label">Cloud name<input className="field-input" value={cloudinary.cloudName} onChange={(event) => setCloudinary({ ...cloudinary, cloudName: event.target.value })} placeholder="your-cloud-name" /></label>
          <label className="field-label">API key<input className="field-input" value={cloudinary.apiKey} onChange={(event) => setCloudinary({ ...cloudinary, apiKey: event.target.value })} placeholder="1234567890" /></label>
          <label className="field-label">API secret<input className="field-input" type="password" value={cloudinary.apiSecret} onChange={(event) => setCloudinary({ ...cloudinary, apiSecret: event.target.value })} placeholder="Cloudinary API secret" /></label>
          <label className="field-label">Folder<input className="field-input" value={cloudinary.folder} onChange={(event) => setCloudinary({ ...cloudinary, folder: event.target.value })} placeholder="cromgen-media" /></label>
        </div>
        <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
          For live backend upload, copy these values into `backend/.env` as `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and `CLOUDINARY_FOLDER`.
        </div>
        <button className="btn-primary mt-5" type="submit"><Cloud size={17} /> Save Cloudinary API</button>
      </form>
    </div>
  )
}

export function PageHeader({ eyebrow, title, text, action }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-cyan-300">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-slate-500 dark:text-slate-400">{text}</p>
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ title, text }) {
  return <div className="glass-card grid min-h-64 place-items-center p-8 text-center"><div><FolderOpen className="mx-auto text-slate-400" size={44} /><h3 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">{title}</h3><p className="mt-2 text-slate-500 dark:text-slate-400">{text}</p></div></div>
}

function Toast({ text, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3200)
    return () => clearTimeout(timer)
  }, [onClose])
  return <div className="fixed right-5 top-20 z-50 rounded-2xl border border-emerald-500/20 bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-2xl shadow-emerald-900/20">{text}</div>
}
