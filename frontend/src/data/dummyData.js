export const demoUsers = [
  { id: 'u-admin', name: 'Avery Stone', email: 'admin@cromgen.com', password: 'admin123', role: 'admin', status: 'Active', permission: 'Full access', avatar: 'AS', phone: '+1 555 100 0101', joined: '2026-01-08' },
  { id: 'u-vendor', name: 'Mira Lens', email: 'vendor@cromgen.com', password: 'vendor123', role: 'vendor', status: 'Active', permission: 'Upload media', avatar: 'ML', phone: '+1 555 100 0102', joined: '2026-02-14' },
  { id: 'u-staff', name: 'Noah Pierce', email: 'staff@cromgen.com', password: 'staff123', role: 'staff', status: 'Active', permission: 'Can approve', avatar: 'NP', phone: '+1 555 100 0103', joined: '2026-03-05' },
  { id: 'u-user', name: 'Elena Reed', email: 'user@cromgen.com', password: 'user123', role: 'user', status: 'Active', permission: 'Can download', avatar: 'ER', phone: '+1 555 100 0104', joined: '2026-03-22' },
]

export const demoCategories = [
  { id: 'cat-1', name: 'Brand Films', description: 'Hero visuals, launch stories, and campaign cuts', active: true },
  { id: 'cat-2', name: 'Product', description: 'Studio product imagery and close-up details', active: true },
  { id: 'cat-3', name: 'Lifestyle', description: 'People, culture, and editorial moments', active: true },
  { id: 'cat-4', name: 'Events', description: 'Conferences, summits, and field activations', active: true },
  { id: 'cat-5', name: 'Architecture', description: 'Spaces, venues, and environmental media', active: true },
]

export const demoMedia = [
  {
    id: 'm-1',
    title: 'Aurora Product Reveal',
    category: 'Brand Films',
    description: 'A polished launch video for a premium hardware rollout.',
    type: 'video',
    status: 'Approved',
    uploadedBy: { id: 'u-vendor', role: 'vendor', name: 'Mira Lens' },
    assignedTo: 'u-staff',
    createdAt: '2026-05-01',
    size: '24 MB',
    remarks: 'Approved for campaign use.',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'm-2',
    title: 'Executive Workspace',
    category: 'Architecture',
    description: 'Quiet editorial image set for a leadership workspace story.',
    type: 'image',
    status: 'Approved',
    uploadedBy: { id: 'u-admin', role: 'admin', name: 'Avery Stone' },
    assignedTo: 'u-staff',
    createdAt: '2026-05-03',
    size: '4.8 MB',
    remarks: '',
    src: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'm-3',
    title: 'Field Team Portraits',
    category: 'Lifestyle',
    description: 'Natural light portraits from a client success feature.',
    type: 'image',
    status: 'Pending',
    uploadedBy: { id: 'u-vendor', role: 'vendor', name: 'Mira Lens' },
    assignedTo: 'u-staff',
    createdAt: '2026-05-08',
    size: '6.1 MB',
    remarks: '',
    src: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'm-4',
    title: 'Summit Keynote Clip',
    category: 'Events',
    description: 'Short event recap for social and internal distribution.',
    type: 'video',
    status: 'Rejected',
    uploadedBy: { id: 'u-vendor', role: 'vendor', name: 'Mira Lens' },
    assignedTo: 'u-staff',
    createdAt: '2026-05-10',
    size: '18 MB',
    remarks: 'Needs final slate and audio cleanup.',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80',
  },
]

export const seedStorage = () => {
  if (!localStorage.getItem('cromgen_users')) localStorage.setItem('cromgen_users', JSON.stringify(demoUsers))
  if (!localStorage.getItem('cromgen_media')) localStorage.setItem('cromgen_media', JSON.stringify(demoMedia))
  if (!localStorage.getItem('cromgen_categories')) localStorage.setItem('cromgen_categories', JSON.stringify(demoCategories))
  if (!localStorage.getItem('cromgen_favorites')) localStorage.setItem('cromgen_favorites', JSON.stringify([]))
  if (!localStorage.getItem('cromgen_theme')) localStorage.setItem('cromgen_theme', 'light')
}
