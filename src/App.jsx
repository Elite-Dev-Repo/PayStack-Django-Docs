import { useState } from 'react'
import Navbar from './components/Navbar'
import LandingPage from './components/LandingPage'
import DocsPage from './components/DocsPage'

export default function App() {
  const [page, setPage]         = useState('landing')
  const [activeDoc, setActiveDoc] = useState('introduction')

  const handleSetActiveDoc = (id) => {
    setActiveDoc(id)
    window.scrollTo(0, 0)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0E1A' }}>
      <Navbar
        page={page}
        setPage={setPage}
        setActiveDoc={handleSetActiveDoc}
      />

      {page === 'landing' && (
        <LandingPage
          setPage={setPage}
          setActiveDoc={handleSetActiveDoc}
        />
      )}

      {page === 'docs' && (
        <div className="pt-14">
          <DocsPage
            activeDoc={activeDoc}
            setActiveDoc={handleSetActiveDoc}
          />
        </div>
      )}
    </div>
  )
}
