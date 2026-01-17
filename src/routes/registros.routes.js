import express from 'express'
import db from '../database/knes.js'

const router = express.Router()

/* ===============================
   POST – Guardar registros
================================ */
router.post('/', async (req, res) => {
  try {
    const { patientId, glucosa, sistolica, diastolica } = req.body

    if (!patientId || !glucosa || !sistolica || !diastolica) {
      return res.status(400).json({ error: 'Datos incompletos' })
    }

    await db('biometrics_history').insert([
      {
        user_id: patientId,
        type: 'glucose',
        value_1: glucosa,
        unit: 'mg/dL'
      },
      {
        user_id: patientId,
        type: 'blood_pressure',
        value_1: sistolica,
        value_2: diastolica,
        unit: 'mmHg'
      }
    ])

    res.status(201).json({ message: 'Registro guardado correctamente' })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/* ===============================
   GET – Dashboard (último registro)
================================ */
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const glucosa = await db('biometrics_history')
      .where({ user_id: userId, type: 'glucose' })
      .orderBy('created_at', 'desc')
      .first()

    const presion = await db('biometrics_history')
      .where({ user_id: userId, type: 'blood_pressure' })
      .orderBy('created_at', 'desc')
      .first()

    res.json({
      glucose: glucosa
        ? {
            value: glucosa.value_1,
            unit: glucosa.unit,
            date: glucosa.created_at
          }
        : null,
      pressure: presion
        ? {
            systolic: presion.value_1,
            diastolic: presion.value_2,
            unit: presion.unit,
            date: presion.created_at
          }
        : null
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/* ===============================
   GET – Historial (últimos 5)
================================ */
router.get('/historial/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const registros = await db('biometrics_history')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .limit(10)

    const historial = []

    for (let i = 0; i < registros.length; i += 2) {
      const r1 = registros[i]
      const r2 = registros[i + 1]

      const glucose = r1.type === 'glucose' ? r1 : r2
      const pressure = r1.type === 'blood_pressure' ? r1 : r2

      if (glucose && pressure) {
        historial.push({
          date: glucose.created_at,
          glucose: glucose.value_1,
          systolic: pressure.value_1,
          diastolic: pressure.value_2
        })
      }
    }

    res.json(historial.slice(0, 5))

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
