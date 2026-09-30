import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout & Protected Route Wrapper
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Role Dashboards
import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import ParentDashboard from './pages/ParentDashboard';

// Module Pages
import ChildrenList from './pages/ChildrenList';
import ChildProfile from './pages/ChildProfile';
import AttendancePage from './pages/AttendancePage';
import GrowthMonitoring from './pages/GrowthMonitoring';
import ImmunizationTracker from './pages/ImmunizationTracker';
import HealthRecordsPage from './pages/HealthRecordsPage';
import PregnantWomenPage from './pages/PregnantWomenPage';
import FoodNutritionPage from './pages/FoodNutritionPage';
import LearningActivitiesPage from './pages/LearningActivitiesPage';
import ReportsPage from './pages/ReportsPage';
import UserManagement from './pages/UserManagement';
import CentersPage from './pages/CentersPage';
import AlertsPage from './pages/AlertsPage';

// Root Dispatcher: Redirects to appropriate home view based on logged-in role
const HomeRedirect = () => {
  const { user, token, loading } = useAuth();
  if (loading) return null;
  if (!token || !user) return <Navigate to="/login" replace />;

  if (user.role === 'admin' || user.is_superuser) return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'supervisor') return <Navigate to="/supervisor/dashboard" replace />;
  if (user.role === 'parent') return <Navigate to="/parent/dashboard" replace />;
  return <Navigate to="/worker/dashboard" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Root redirect */}
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/dashboard" element={<HomeRedirect />} />

      {/* ---------------- Admin Protected Routes ---------------- */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<Layout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/centers" element={<CentersPage />} />
          <Route path="/admin/children" element={<ChildrenList />} />
          <Route path="/admin/children/:id" element={<ChildProfile />} />
          <Route path="/admin/attendance" element={<AttendancePage />} />
          <Route path="/admin/growth" element={<GrowthMonitoring />} />
          <Route path="/admin/immunizations" element={<ImmunizationTracker />} />
          <Route path="/admin/health" element={<HealthRecordsPage />} />
          <Route path="/admin/pregnant-women" element={<PregnantWomenPage />} />
          <Route path="/admin/food" element={<FoodNutritionPage />} />
          <Route path="/admin/activities" element={<LearningActivitiesPage />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
          <Route path="/admin/alerts" element={<AlertsPage />} />
        </Route>
      </Route>

      {/* ---------------- Worker Protected Routes ---------------- */}
      <Route element={<ProtectedRoute allowedRoles={['worker', 'admin']} />}>
        <Route element={<Layout />}>
          <Route path="/worker/dashboard" element={<WorkerDashboard />} />
          <Route path="/worker/children" element={<ChildrenList />} />
          <Route path="/worker/children/:id" element={<ChildProfile />} />
          <Route path="/worker/attendance" element={<AttendancePage />} />
          <Route path="/worker/growth" element={<GrowthMonitoring />} />
          <Route path="/worker/immunizations" element={<ImmunizationTracker />} />
          <Route path="/worker/health" element={<HealthRecordsPage />} />
          <Route path="/worker/pregnant-women" element={<PregnantWomenPage />} />
          <Route path="/worker/food" element={<FoodNutritionPage />} />
          <Route path="/worker/activities" element={<LearningActivitiesPage />} />
          <Route path="/worker/reports" element={<ReportsPage />} />
        </Route>
      </Route>

      {/* ---------------- Supervisor Protected Routes ---------------- */}
      <Route element={<ProtectedRoute allowedRoles={['supervisor', 'admin']} />}>
        <Route element={<Layout />}>
          <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
          <Route path="/supervisor/centers" element={<CentersPage />} />
          <Route path="/supervisor/children" element={<ChildrenList />} />
          <Route path="/supervisor/children/:id" element={<ChildProfile />} />
          <Route path="/supervisor/attendance" element={<AttendancePage />} />
          <Route path="/supervisor/growth" element={<GrowthMonitoring />} />
          <Route path="/supervisor/alerts" element={<AlertsPage />} />
          <Route path="/supervisor/pregnant-women" element={<PregnantWomenPage />} />
          <Route path="/supervisor/food" element={<FoodNutritionPage />} />
          <Route path="/supervisor/reports" element={<ReportsPage />} />
        </Route>
      </Route>

      {/* ---------------- Parent Protected Routes ---------------- */}
      <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
        <Route element={<Layout />}>
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
          <Route path="/parent/attendance" element={<AttendancePage />} />
          <Route path="/parent/growth" element={<GrowthMonitoring />} />
          <Route path="/parent/immunizations" element={<ImmunizationTracker />} />
          <Route path="/parent/meals" element={<FoodNutritionPage />} />
          <Route path="/parent/activities" element={<LearningActivitiesPage />} />
        </Route>
      </Route>

      {/* Fallback to Home */}
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

export default App;
