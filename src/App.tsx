import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Performance Optimization: Route-Based Code Splitting
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Admin = lazy(() => import('./pages/Admin'));
const Shop = lazy(() => import('./pages/Shop'));
const VIP = lazy(() => import('./pages/VIP'));
const Topup = lazy(() => import('./pages/Topup'));
const Earn = lazy(() => import('./pages/Earn'));
const Withdraw = lazy(() => import('./pages/Withdraw'));
const Support = lazy(() => import('./pages/Support'));

// UI/UX Optimization: On-brand skeleton/spinner during lazy load fetching
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[#13151c]">
    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white/10 border-t-[#3b82f6]"></div>
  </div>
);

// New: Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/auth" replace />;
  
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Route */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Routes Wrapper */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<Shop />} />
              <Route path="/vip" element={<VIP />} />
              <Route path="/earn" element={<Earn />} />
              <Route path="/topup" element={<Topup />} />
              <Route path="/withdraw" element={<Withdraw />} />
              <Route path="/support" element={<Support />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
      <Toaster theme="dark" position="top-center" richColors />
    </BrowserRouter>
  );
}
