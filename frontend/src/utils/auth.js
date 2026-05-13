import { seedStorage } from '../data/dummyData'

const read = (key, fallback = []) => {
  seedStorage()
  return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
}

const write = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new Event('cromgen-storage'))
}

export const store = {
  users: () => read('cromgen_users'),
  media: () => read('cromgen_media'),
  categories: () => read('cromgen_categories'),
  favorites: () => read('cromgen_favorites'),
  setUsers: (items) => write('cromgen_users', items),
  setMedia: (items) => write('cromgen_media', items),
  setCategories: (items) => write('cromgen_categories', items),
  setFavorites: (items) => write('cromgen_favorites', items),
}

export const getCurrentUser = () => {
  seedStorage()
  return JSON.parse(localStorage.getItem('cromgen_current_user') || 'null')
}

export const login = ({ email, password, role }) => {
  const user = store.users().find((item) => item.email === email && item.password === password && item.role === role)
  if (!user) return null
  localStorage.setItem('cromgen_current_user', JSON.stringify(user))
  return user
}

export const logout = () => {
  localStorage.removeItem('cromgen_current_user')
}

export const upsertUser = (payload) => {
  const users = store.users()
  const next = payload.id
    ? users.map((item) => (item.id === payload.id ? { ...item, ...payload } : item))
    : [{ ...payload, id: `u-${crypto.randomUUID()}`, joined: new Date().toISOString().slice(0, 10), avatar: payload.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(), status: 'Active' }, ...users]
  store.setUsers(next)
}

export const addMedia = (payload, user) => {
  const type = payload.file?.type?.startsWith('video') ? 'video' : 'image'
  const url = payload.file ? URL.createObjectURL(payload.file) : payload.src
  const item = {
    id: `m-${crypto.randomUUID()}`,
    title: payload.title,
    category: payload.category,
    description: payload.description,
    type,
    status: user.role === 'admin' ? 'Approved' : 'Pending',
    uploadedBy: { id: user.id, role: user.role, name: user.name },
    assignedTo: 'u-staff',
    createdAt: new Date().toISOString().slice(0, 10),
    size: payload.file ? `${(payload.file.size / 1024 / 1024).toFixed(1)} MB` : 'Demo file',
    remarks: '',
    deviceInfo: payload.deviceInfo || null,
    src: url,
    thumbnail: type === 'image' ? url : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80',
  }
  store.setMedia([item, ...store.media()])
  return item
}

export const updateMedia = (id, patch) => {
  store.setMedia(store.media().map((item) => (item.id === id ? { ...item, ...patch } : item)))
}

export const deleteMedia = (id) => {
  store.setMedia(store.media().filter((item) => item.id !== id))
}
