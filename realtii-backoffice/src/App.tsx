// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import { ApiPortal } from './pages/ApiPortal';
import { BillingWall } from './pages/BillingWall';
import { Checkout } from './pages/Checkout';
import { LandingPage } from './pages/LandingPage'; // NEW
import { AuthPage } from './pages/AuthPage';       // NEW

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- PUBLIC ZONES --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* --- ONBOARDING & BILLING --- */}
        <Route path="/billing" element={<BillingWall />} />
        <Route path="/checkout/:id" element={<Checkout />} />
        
        {/* --- SECURE PRIVATE ZONES --- */}
        <Route path="/developer-portal" element={<ApiPortal />} />
        <Route path="/admin" element={<ExecutiveDashboard />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;