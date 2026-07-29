'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar({ children }) {
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const profileUrl = `/${user?.user_metadata?.username || 'profile'}`

  const Icons = {
    Dashboard: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor"/>
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor"/>
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor"/>
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor"/>
      </svg>
    ),
    Package: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z" stroke="currentColor"/>
        <polyline points="2.32 6.16 12 11 21.68 6.16" stroke="currentColor"/>
        <line x1="12" y1="22.76" x2="12" y2="11" stroke="currentColor"/>
      </svg>
    ),
    Folder: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke="currentColor"/>
      </svg>
    ),
    Settings: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="12" r="3" stroke="currentColor"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor"/>
      </svg>
    ),
    User: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor"/>
        <circle cx="12" cy="7" r="4" stroke="currentColor"/>
      </svg>
    ),
    Logout: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor"/>
        <polyline points="16 17 21 12 16 7" stroke="currentColor"/>
        <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor"/>
      </svg>
    ),
    Arrow: () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <polyline points="9 6 15 12 9 18" stroke="currentColor"/>
      </svg>
    ),
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Icons.Dashboard },
    { name: 'Products', path: '/products', icon: Icons.Package },
    { name: 'Categories', path: '/categories', icon: Icons.Folder },
    { name: 'Settings', path: '/settings', icon: Icons.Settings },
  ]

  // ============================================
  // FIXED: Show sidebar with loading in content
  // ============================================
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f' }}>
      {/* SIDEBAR - Always visible */}
      <aside style={{
        width: '240px',
        background: '#14141e',
        borderRight: '1px solid #2a2a3e',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 12px',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        overflowY: 'auto',
        zIndex: 100,
        transition: 'transform 0.3s ease',
        transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(0)',
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px 16px',
          borderBottom: '1px solid #2a2a3e',
          marginBottom: '16px'
        }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#f1f1f1' }}>
            <svg width="28" height="28" viewBox="0 0 30 32" fill="currentColor" style={{ color: '#6366f1', flexShrink: 0 }}>
              <path d="M15 0.124727C15.4832 0.124727 15.8748 0.516607 15.875 0.999727V8.88645L24.3809 0.380586C24.6311 0.130476 25.0081 0.0557816 25.335 0.191133C25.6618 0.326537 25.8749 0.645944 25.875 0.999727V10.1003H28.75L28.8398 10.1052C29.2809 10.1502 29.625 10.5224 29.625 10.9753V23.5007C29.6246 23.9836 29.233 24.3757 28.75 24.3757H25.875V30.9997C25.875 31.3536 25.6619 31.6729 25.335 31.8083C25.008 31.9438 24.6311 31.8691 24.3809 31.6189L15.875 23.113V30.9997C15.875 31.483 15.4832 31.8747 15 31.8747C14.5168 31.8747 14.125 31.483 14.125 30.9997V23.113L5.61914 31.6189C5.36889 31.8691 4.992 31.9438 4.66504 31.8083C4.33815 31.6729 4.125 31.3536 4.125 30.9997V24.3757H1.25C0.76699 24.3757 0.375388 23.9836 0.375 23.5007V10.9753C0.375 10.4921 0.766751 10.1003 1.25 10.1003H4.125V0.999727C4.12511 0.645944 4.33818 0.326537 4.66504 0.191133C4.99192 0.0557816 5.36892 0.130476 5.61914 0.380586L14.125 8.88645V0.999727C14.1252 0.516607 14.5168 0.124727 15 0.124727ZM5.875 20.1462V28.8864L14.125 20.6364V12.9275L5.875 20.1462ZM15.875 20.6364L24.125 28.8864V20.1462L15.875 12.9275V20.6364ZM2.125 22.6257H4.125V19.7497L4.12988 19.656C4.15334 19.4388 4.25778 19.2369 4.42383 19.0915L12.6992 11.8503H5.20312C5.13787 11.8658 5.07001 11.8747 5 11.8747C4.92999 11.8747 4.86213 11.8658 4.79688 11.8503H2.125V22.6257ZM25.5762 19.0915C25.7659 19.2576 25.8749 19.4976 25.875 19.7497V22.6257H27.875V11.8503H25.2031C25.1379 11.8658 25.07 11.8747 25 11.8747C24.93 11.8747 24.8621 11.8658 24.7969 11.8503H17.3008L25.5762 19.0915ZM5.875 10.1003H12.8623L5.875 3.11301V10.1003ZM17.1377 10.1003H24.125V3.11301L17.1377 10.1003Z"/>
            </svg>
            <span style={{ fontSize: '18px', fontWeight: '700' }}>Ship<span style={{ color: '#6366f1' }}>folio</span></span>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <Link
                key={item.path}
                href={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  color: isActive ? '#f1f1f1' : '#a1a1b9',
                  background: isActive ? '#1c1c2e' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <span style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#6366f1' : '#a1a1b9' }}>
                  <item.icon />
                </span>
                <span>{item.name}</span>
              </Link>
            )
          })}
          <Link href={profileUrl} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 12px',
            borderRadius: '8px',
            color: pathname === profileUrl ? '#f1f1f1' : '#a1a1b9',
            background: pathname === profileUrl ? '#1c1c2e' : 'transparent',
            textDecoration: 'none',
            transition: 'all 0.2s',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <span style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: pathname === profileUrl ? '#6366f1' : '#a1a1b9' }}>
              <Icons.User />
            </span>
            <span>Public Profile</span>
          </Link>
        </nav>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #2a2a3e', paddingTop: '12px' }}>
          {!loading ? (
            <>
              <Link href="/settings" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#f1f1f1',
                transition: 'all 0.2s'
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'white'
                }}>
                  {user?.user_metadata?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize: '14px', fontWeight: '500', flex: 1 }}>
                  {user?.user_metadata?.username || 'User'}
                </span>
                <span style={{ color: '#a1a1b9', display: 'flex', alignItems: 'center' }}>
                  <Icons.Arrow />
                </span>
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  window.location.href = '/login'
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  width: '100%',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <span style={{ width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icons.Logout />
                </span>
                Logout
              </button>
            </>
          ) : (
            // Show a placeholder while loading
            <div style={{ padding: '8px 12px', color: '#a1a1b9', fontSize: '14px' }}>
              Loading...
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 50,
          display: 'block'
        }} onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* MOBILE MENU BUTTON */}
      <button
        style={{
          display: 'none',
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 200,
          background: '#14141e',
          border: '1px solid #2a2a3e',
          borderRadius: '8px',
          padding: '8px 12px',
          cursor: 'pointer',
          color: '#f1f1f1',
          fontSize: '18px'
        }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="mobile-menu-btn"
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* MAIN CONTENT */}
      <main style={{ 
        marginLeft: '240px', 
        flex: 1, 
        padding: '40px', 
        minHeight: '100vh',
        width: 'calc(100% - 240px)'
      }}>
        {loading ? (
          // Show loading only in the content area, not full page
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '60vh',
            color: '#a1a1b9',
            fontSize: '16px'
          }}>
            <p>Loading...</p>
          </div>
        ) : (
          children
        )}
      </main>

      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
          aside {
            transform: translateX(${isMobileMenuOpen ? '0' : '-100%'}) !important;
          }
          main {
            margin-left: 0 !important;
            width: 100% !important;
            padding: 80px 16px 24px !important;
          }
        }
      `}</style>
    </div>
  )
}