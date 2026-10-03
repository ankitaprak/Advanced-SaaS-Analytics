import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import './App.css'

import DashboardPage from './pages/DashboardPage'
import DashboardLayout from './layouts/DashboardLayout'
import AnalyticsPage from './pages/AnalyticsPage'
import RevenuePage from './pages/RevenuePage'
import UsersPage from './pages/UsersPage'
import ReportsPage from './pages/ReportsPage'
import CreateNotificationPage from './pages/CreateNotificationPage'
import ActivityLogsPage from './pages/ActivityLogsPage'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/common/ProtectedRoute'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

            <Route
              path="/analytics"
              element={<AnalyticsPage />}
            />

            <Route
              path="/revenue"
              element={<RevenuePage />}
            />

            <Route
              path="/users"
              element={<UsersPage />}
            />

            <Route
              path="/reports"
              element={<ReportsPage />}
            />

            <Route
              path="/notifications/create"
              element={<CreateNotificationPage />}
            />

            <Route
              path="/activity-logs"
              element={<ActivityLogsPage />}
            />
          </Route>
        </Route>

        {/* Unknown route */}
        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App