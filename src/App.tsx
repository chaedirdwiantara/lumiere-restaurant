import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import { CursorFollower } from './components/ui/CursorFollower'
import { useLenis } from './hooks/useLenis'

function App() {
  // Initialize smooth scrolling
  useLenis();

  return (
    <Router>
      <CursorFollower />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
