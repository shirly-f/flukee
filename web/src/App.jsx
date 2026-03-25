import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterCoachPage from './pages/RegisterCoachPage';
import TraineeListPage from './pages/TraineeListPage';
import TraineeOverviewPage from './pages/TraineeOverviewPage';
import CreateTaskPage from './pages/CreateTaskPage';
import MessagesPage from './pages/MessagesPage';
import TraineeHomePage from './pages/TraineeHomePage';
import TraineeTaskDetailPage from './pages/TraineeTaskDetailPage';

function PrivateRoute({ children }) {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t('common.loading')}</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'coach') {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function HomeRedirect() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">{t('common.loading')}</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'trainee' ? '/my-tasks' : '/trainees'} replace />;
}

function TraineeRoute({ children }) {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t('common.loading')}</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'trainee') {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/coach" element={<RegisterCoachPage />} />
        <Route
          path="/trainees"
          element={
            <PrivateRoute>
              <TraineeListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/trainees/:traineeId"
          element={
            <PrivateRoute>
              <TraineeOverviewPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/trainees/:traineeId/tasks/new"
          element={
            <PrivateRoute>
              <CreateTaskPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <MessagesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-tasks"
          element={
            <TraineeRoute>
              <TraineeHomePage />
            </TraineeRoute>
          }
        />
        <Route
          path="/my-tasks/:taskId"
          element={
            <TraineeRoute>
              <TraineeTaskDetailPage />
            </TraineeRoute>
          }
        />
        <Route path="/" element={<HomeRedirect />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
