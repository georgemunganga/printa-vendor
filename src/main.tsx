import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from '@/context/auth-context'
import { CurrencyProvider } from '@/context/currency-context'
import { LocationProvider } from '@/context/location-context'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <LocationProvider>
      <CurrencyProvider>
        <App />
      </CurrencyProvider>
    </LocationProvider>
  </AuthProvider>
);
