
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeAuthFix } from '@/utils/authFix'
import '@/utils/errorSuppression'

// Clear corrupted authentication state on app startup
initializeAuthFix();

createRoot(document.getElementById("root")!).render(<App />);
