import { Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthModal from './components/AuthModal'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import StarField from './components/StarField'
import PageTransition from './components/PageTransition'
import Home from './pages/Home'
import BirthChart from './pages/BirthChart'
import Reading from './pages/Reading'
import Donate from './pages/Donate'
import Success from './pages/Success'
import About from './pages/About'
import Account from './pages/Account'
import Transits from './pages/Transits'
import ResetPassword from './pages/ResetPassword'

function AppInner() {
  const { authModalOpen, closeAuthModal } = useAuth()
  return (
    <>
      <StarField />
      <Navbar />
      <main>
        <PageTransition>
          <Routes>
            <Route path="/"        element={<Home />} />
            <Route path="/chart"   element={<BirthChart />} />
            <Route path="/reading" element={<Reading />} />
            <Route path="/donate"  element={<Donate />} />
            <Route path="/success" element={<Success />} />
            <Route path="/about"   element={<About />} />
            <Route path="/account" element={<Account />} />
            <Route path="/transits" element={<Transits />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </PageTransition>
      </main>
      <Footer />
      <AuthModal isOpen={authModalOpen} onClose={closeAuthModal} />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
