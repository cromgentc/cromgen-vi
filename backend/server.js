import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import { configureCloudinary } from './config/cloudinary.js'
import connectDB from './config/db.js'
import { errorHandler, notFound } from './middlewares/errorMiddleware.js'
import authRoutes from './routes/authRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import mediaRoutes from './routes/mediaRoutes.js'
import userRoutes from './routes/userRoutes.js'
import { seedDemoData } from './utils/seedData.js'

dotenv.config()

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

connectDB().then(seedDemoData)
configureCloudinary()

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.use(cors({
  origin: process.env.CLIENT_URL?.split(',') || '*',
  credentials: true,
}))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')))

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Cromgen Media Collection Portal API is running',
    health: '/api/health',
  })
})

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    service: 'cromgen-media-backend',
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/media', mediaRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.use(notFound)
app.use(errorHandler)

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`)
})
