import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SurveyPage } from './pages/SurveyPage'

// El panel (con Recharts) se carga aparte para que la encuesta pese lo mínimo en el celular
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })))

function Cargando() {
  return (
    <p className="grid min-h-dvh place-items-center text-sm font-semibold text-slate-500" role="status">
      Cargando el panel…
    </p>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SurveyPage />} />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<Cargando />}>
              <AdminPage />
            </Suspense>
          }
        />
        <Route path="*" element={<SurveyPage />} />
      </Routes>
    </BrowserRouter>
  )
}
