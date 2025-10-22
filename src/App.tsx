import Layout from './components/layout/Layout'
import Home from './pages/Home'
import { CursorFollower } from './components/ui/CursorFollower'
import { useLenis } from './hooks/useLenis'

function App() {
  // Initialize smooth scrolling
  useLenis();

  return (
    <>
      <CursorFollower />
      <Layout>
        <Home />
      </Layout>
    </>
  )
}

export default App
