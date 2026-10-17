import { Navigate, Route, Routes } from 'react-router-dom';
import { getToken } from './api';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ExpensesPage from './pages/Expenses';
import CategoriesPage from './pages/Categories';
import Settings from './pages/Settings';

function Protected() {
  return getToken() ? <Layout /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected />}>
        <Route index element={<Dashboard />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}