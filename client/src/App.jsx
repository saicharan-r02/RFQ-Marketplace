import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import BuyerDashboard from './pages/BuyerDashboard';
import CreateRfq from './pages/CreateRfq';
import SupplierMarketplace from './pages/SupplierMarketplace';
import SupplierQuotes from './pages/SupplierQuotes';
import RfqDetails from './pages/RfqDetails';


function HomeRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return user?.role === 'BUYER' ? (
    <Navigate to="/buyer/dashboard" replace />
  ) : (
    <Navigate to="/supplier/marketplace" replace />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Routes>
                <Route path="/rfqs/:id" element={<RfqDetails />} />
                <Route path="/" element={<HomeRedirect />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/buyer/dashboard" element={<ProtectedRoute allowedRoles={['BUYER']}>
                  <BuyerDashboard />
                </ProtectedRoute>} />
                <Route path="/buyer/create-rfq" element={<ProtectedRoute allowedRoles={['BUYER']}>
                  <CreateRfq />
                </ProtectedRoute>} />
                <Route path="/supplier/marketplace" element={<ProtectedRoute allowedRoles={['SUPPLIER']}>
                  <SupplierMarketplace />
                </ProtectedRoute>}
                />
                <Route path="/supplier/my-quotes" element={<ProtectedRoute allowedRoles={['SUPPLIER']}>
                  <SupplierQuotes />
                </ProtectedRoute>}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}