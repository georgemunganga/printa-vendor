import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// ── Provider layers (ordered by dependency) ──
// 1. Theme     – visual layer, no deps
// 2. Auth      – identity, roles, permissions
// 3. Store     – depends on Auth (owner vs staff store access)
// 4. Location  – geographic context
// 5. Currency  – monetary formatting
// 6. (inside App.tsx: Notification → Job – both depend on Store)
import { ThemeProvider } from '@/context/theme-context'
import { AuthProvider } from '@/context/auth-context'
import { StoreProvider } from '@/context/store-context'
import { LocationProvider } from '@/context/location-context'
import { CurrencyProvider } from '@/context/currency-context'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AuthProvider>
      <StoreProvider>
        <LocationProvider>
          <CurrencyProvider>
            <App />
          </CurrencyProvider>
        </LocationProvider>
      </StoreProvider>
    </AuthProvider>
  </ThemeProvider>
);
