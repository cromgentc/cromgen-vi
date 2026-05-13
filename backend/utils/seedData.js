import Category from '../models/Category.js'
import User from '../models/User.js'

const users = [
  {
    name: 'Avery Stone',
    email: 'admin@cromgen.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'AS',
    permission: { canApprove: true, canDownload: true, canUpload: true },
  },
  {
    name: 'Mira Lens',
    email: 'vendor@cromgen.com',
    password: 'vendor123',
    role: 'vendor',
    avatar: 'ML',
    permission: { canApprove: false, canDownload: false, canUpload: true },
  },
  {
    name: 'Noah Pierce',
    email: 'staff@cromgen.com',
    password: 'staff123',
    role: 'staff',
    avatar: 'NP',
    permission: { canApprove: true, canDownload: true, canUpload: false },
  },
  {
    name: 'Elena Reed',
    email: 'user@cromgen.com',
    password: 'user123',
    role: 'user',
    avatar: 'ER',
    permission: { canApprove: false, canDownload: true, canUpload: true },
  },
]

const categories = [
  { name: 'Brand Films', description: 'Hero visuals, launch stories, and campaign cuts' },
  { name: 'Product', description: 'Studio product imagery and close-up details' },
  { name: 'Lifestyle', description: 'People, culture, and editorial moments' },
  { name: 'Events', description: 'Conferences, summits, and field activations' },
  { name: 'Architecture', description: 'Spaces, venues, and environmental media' },
]

export const seedDemoData = async () => {
  const userCount = await User.countDocuments()
  if (!userCount) {
    await User.create(users)
    console.log('Demo users seeded')
  }

  const categoryCount = await Category.countDocuments()
  if (!categoryCount) {
    const admin = await User.findOne({ role: 'admin' })
    await Category.create(categories.map((category) => ({ ...category, createdBy: admin?._id })))
    console.log('Demo categories seeded')
  }
}
