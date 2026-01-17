import express from 'express'
import cors from 'cors'
import registrosRoutes from './routes/registros.routes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/registros', registrosRoutes)

export default app
