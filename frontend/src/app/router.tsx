import { lazy } from 'react'
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/auth'
import { AppShell, PublicHeader } from '@/components/layout'
import { LoadingScreen } from '@/components/ui'
import LoginPage from '@/pages/login'
import RegisterPage from '@/pages/login/RegisterPage'
const DashboardPage = lazy(() => import('@/pages/dashboard'))
const ModelsPage = lazy(() => import('@/pages/models'))
const ModelDetailPage = lazy(() => import('@/pages/models/ModelDetailPage'))
const VehiclesPage = lazy(() => import('@/pages/vehicles'))
const VehicleDetailPage = lazy(() => import('@/pages/vehicles/VehicleDetailPage'))
const LeasesPage = lazy(() => import('@/pages/leases/LeasesPage'))
const NewLeasePage = lazy(() => import('@/pages/leases/NewLeasePage'))
const LeaseDetailPage = lazy(() => import('@/pages/leases/LeaseDetailPage'))
const DriversPage = lazy(() => import('@/pages/drivers'))
const DriverDetailPage = lazy(() => import('@/pages/drivers/DriverDetailPage'))
const DispatchPage = lazy(() => import('@/pages/dispatch'))
const MaintenancePage = lazy(() => import('@/pages/maintenance'))
const FinancePage = lazy(() => import('@/pages/finance'))
const ReportsPage = lazy(() => import('@/pages/reports'))
const SettingsPage = lazy(() => import('@/pages/settings'))
import CreditsPage from '@/pages/Credits'
import NotFoundPage from '@/pages/NotFound'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <LoadingScreen label="正在验证登录状态" />
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <>{children}</>
}

function CreditsRoute() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen label="正在验证登录状态" />
  if (user) return <AppShell><CreditsPage /></AppShell>
  return (
    <div className="min-h-[100dvh] bg-canvas">
      <PublicHeader to="/login" action="返回登录" />
      <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6">
        <CreditsPage />
      </main>
    </div>
  )
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/credits', element: <CreditsRoute /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'models', element: <ModelsPage /> },
      { path: 'models/:slug', element: <ModelDetailPage /> },
      { path: 'vehicles', element: <VehiclesPage /> },
      { path: 'vehicles/:id', element: <VehicleDetailPage /> },
      { path: 'leases', element: <LeasesPage /> },
      { path: 'leases/new', element: <NewLeasePage /> },
      { path: 'leases/:id', element: <LeaseDetailPage /> },
      { path: 'drivers', element: <DriversPage /> },
      { path: 'drivers/:id', element: <DriverDetailPage /> },
      { path: 'dispatch', element: <DispatchPage /> },
      { path: 'maintenance', element: <MaintenancePage /> },
      { path: 'finance', element: <FinancePage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])