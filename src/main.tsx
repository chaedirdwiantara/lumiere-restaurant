import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import AdminApp from './admin/App'
import './index.css'
import './styles/design-tokens.css'
import './styles/elegant-gallery.css'

// Determine which app to render based on the URL path
const isAdminRoute = window.location.pathname.startsWith('/admin');

// Add admin-route class to body for admin routes
if (isAdminRoute) {
  document.body.classList.add('admin-route');
} else {
  document.body.classList.remove('admin-route');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdminRoute ? <AdminApp /> : <App />}
  </StrictMode>,
)
