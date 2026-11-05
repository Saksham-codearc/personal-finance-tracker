import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import LoadingScreen from './components/ui/LoadingScreen';
import PageLoader from './components/ui/PageLoader';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const BudgetsPage = lazy(() => import('./pages/BudgetsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function AuthPage({ children }) {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
}

function AppPage({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route
            path="/login"
            element={
              <AuthPage>
                <LoginPage />
              </AuthPage>
            }
          />
          <Route
            path="/register"
            element={
              <AuthPage>
                <RegisterPage />
              </AuthPage>
            }
          />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              index
              element={
                <AppPage>
                  <DashboardPage />
                </AppPage>
              }
            />
            <Route
              path="/transactions"
              element={
                <AppPage>
                  <TransactionsPage />
                </AppPage>
              }
            />
            <Route
              path="/budgets"
              element={
                <AppPage>
                  <BudgetsPage />
                </AppPage>
              }
            />
            <Route
              path="/settings"
              element={
                <AppPage>
                  <SettingsPage />
                </AppPage>
              }
            />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <AuthPage>
              <NotFoundPage />
            </AuthPage>
          }
        />
      </Routes>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3200,
          style: {
            background: '#0b1411',
            color: '#ffffff',
            borderRadius: '14px',
            fontSize: '13px',
            fontWeight: 500,
            padding: '10px 14px',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 16px 40px -16px rgba(0,0,0,0.6)',
          },
          success: {
            iconTheme: { primary: '#36cf8c', secondary: '#0b1411' },
          },
          error: {
            iconTheme: { primary: '#fb7185', secondary: '#0b1411' },
          },
        }}
      />
    </>
  );
}
