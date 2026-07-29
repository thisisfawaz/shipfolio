'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const supabase = createClient()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      minHeight: '100vh',
      background: '#0a0a0f'
    }}>
      {/* LEFT SIDE - Info (hidden on mobile) */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 40px',
          background: '#14141e',
          borderRight: '1px solid #2a2a3e'
        }}
        className="desktop-info"
      >
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <svg width="40" height="40" viewBox="0 0 30 32" fill="currentColor" style={{ color: '#6366f1' }}>
              <path d="M15 0.124727C15.4832 0.124727 15.8748 0.516607 15.875 0.999727V8.88645L24.3809 0.380586C24.6311 0.130476 25.0081 0.0557816 25.335 0.191133C25.6618 0.326537 25.8749 0.645944 25.875 0.999727V10.1003H28.75L28.8398 10.1052C29.2809 10.1502 29.625 10.5224 29.625 10.9753V23.5007C29.6246 23.9836 29.233 24.3757 28.75 24.3757H25.875V30.9997C25.875 31.3536 25.6619 31.6729 25.335 31.8083C25.008 31.9438 24.6311 31.8691 24.3809 31.6189L15.875 23.113V30.9997C15.875 31.483 15.4832 31.8747 15 31.8747C14.5168 31.8747 14.125 31.483 14.125 30.9997V23.113L5.61914 31.6189C5.36889 31.8691 4.992 31.9438 4.66504 31.8083C4.33815 31.6729 4.125 31.3536 4.125 30.9997V24.3757H1.25C0.76699 24.3757 0.375388 23.9836 0.375 23.5007V10.9753C0.375 10.4921 0.766751 10.1003 1.25 10.1003H4.125V0.999727C4.12511 0.645944 4.33818 0.326537 4.66504 0.191133C4.99192 0.0557816 5.36892 0.130476 5.61914 0.380586L14.125 8.88645V0.999727C14.1252 0.516607 14.5168 0.124727 15 0.124727ZM5.875 20.1462V28.8864L14.125 20.6364V12.9275L5.875 20.1462ZM15.875 20.6364L24.125 28.8864V20.1462L15.875 12.9275V20.6364ZM2.125 22.6257H4.125V19.7497L4.12988 19.656C4.15334 19.4388 4.25778 19.2369 4.42383 19.0915L12.6992 11.8503H5.20312C5.13787 11.8658 5.07001 11.8747 5 11.8747C4.92999 11.8747 4.86213 11.8658 4.79688 11.8503H2.125V22.6257ZM25.5762 19.0915C25.7659 19.2576 25.8749 19.4976 25.875 19.7497V22.6257H27.875V11.8503H25.2031C25.1379 11.8658 25.07 11.8747 25 11.8747C24.93 11.8747 24.8621 11.8658 24.7969 11.8503H17.3008L25.5762 19.0915ZM5.875 10.1003H12.8623L5.875 3.11301V10.1003ZM17.1377 10.1003H24.125V3.11301L17.1377 10.1003Z"/>
            </svg>
            <span style={{ fontSize: '24px', fontWeight: '700', color: '#f1f1f1' }}>Ship<span style={{ color: '#6366f1' }}>folio</span></span>
          </div>

          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#f1f1f1',
            marginBottom: '16px',
            lineHeight: '1.2'
          }}>
            Welcome back
          </h1>
          <p style={{ 
            color: '#a1a1b9', 
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '32px'
          }}>
            Sign in to continue managing your product portfolio.
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            paddingTop: '24px',
            borderTop: '1px solid #2a2a3e'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#a1a1b9' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Document every product you build</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#a1a1b9' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Showcase your work automatically</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#a1a1b9' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Earn medals as you ship more</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 40px'
      }}>
        <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
          {/* Mobile Logo + Brief Info */}
          <div
            style={{
              display: 'none',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '32px'
            }}
            className="mobile-info"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <svg width="32" height="32" viewBox="0 0 30 32" fill="currentColor" style={{ color: '#6366f1' }}>
                <path d="M15 0.124727C15.4832 0.124727 15.8748 0.516607 15.875 0.999727V8.88645L24.3809 0.380586C24.6311 0.130476 25.0081 0.0557816 25.335 0.191133C25.6618 0.326537 25.8749 0.645944 25.875 0.999727V10.1003H28.75L28.8398 10.1052C29.2809 10.1502 29.625 10.5224 29.625 10.9753V23.5007C29.6246 23.9836 29.233 24.3757 28.75 24.3757H25.875V30.9997C25.875 31.3536 25.6619 31.6729 25.335 31.8083C25.008 31.9438 24.6311 31.8691 24.3809 31.6189L15.875 23.113V30.9997C15.875 31.483 15.4832 31.8747 15 31.8747C14.5168 31.8747 14.125 31.483 14.125 30.9997V23.113L5.61914 31.6189C5.36889 31.8691 4.992 31.9438 4.66504 31.8083C4.33815 31.6729 4.125 31.3536 4.125 30.9997V24.3757H1.25C0.76699 24.3757 0.375388 23.9836 0.375 23.5007V10.9753C0.375 10.4921 0.766751 10.1003 1.25 10.1003H4.125V0.999727C4.12511 0.645944 4.33818 0.326537 4.66504 0.191133C4.99192 0.0557816 5.36892 0.130476 5.61914 0.380586L14.125 8.88645V0.999727C14.1252 0.516607 14.5168 0.124727 15 0.124727ZM5.875 20.1462V28.8864L14.125 20.6364V12.9275L5.875 20.1462ZM15.875 20.6364L24.125 28.8864V20.1462L15.875 12.9275V20.6364ZM2.125 22.6257H4.125V19.7497L4.12988 19.656C4.15334 19.4388 4.25778 19.2369 4.42383 19.0915L12.6992 11.8503H5.20312C5.13787 11.8658 5.07001 11.8747 5 11.8747C4.92999 11.8747 4.86213 11.8658 4.79688 11.8503H2.125V22.6257ZM25.5762 19.0915C25.7659 19.2576 25.8749 19.4976 25.875 19.7497V22.6257H27.875V11.8503H25.2031C25.1379 11.8658 25.07 11.8747 25 11.8747C24.93 11.8747 24.8621 11.8658 24.7969 11.8503H17.3008L25.5762 19.0915ZM5.875 10.1003H12.8623L5.875 3.11301V10.1003ZM17.1377 10.1003H24.125V3.11301L17.1377 10.1003Z"/>
              </svg>
              <span style={{ fontSize: '20px', fontWeight: '700', color: '#f1f1f1' }}>Ship<span style={{ color: '#6366f1' }}>folio</span></span>
            </div>
            <p style={{ 
              color: '#a1a1b9', 
              fontSize: '14px',
              textAlign: 'center',
              margin: 0
            }}>
              The portfolio built for people who ship products.
            </p>
          </div>

          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#f1f1f1',
            marginBottom: '8px',
            textAlign: 'left'
          }}>
            Sign In
          </h2>
          <p style={{ color: '#a1a1b9', marginBottom: '32px', textAlign: 'left' }}>
            Enter your credentials to access your account.
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: '#a1a1b9' }}>Email</label>
              <input
                type="email"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#0a0a0f',
                  border: '1px solid #2a2a3e',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#f1f1f1',
                  fontFamily: 'inherit'
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: '#a1a1b9' }}>Password</label>
              <input
                type="password"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#0a0a0f',
                  border: '1px solid #2a2a3e',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#f1f1f1',
                  fontFamily: 'inherit'
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 24px',
                background: '#6366f1',
                color: 'white',
                borderRadius: '10px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#4f46e5'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#6366f1'}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', color: '#a1a1b9', fontSize: '14px' }}>
            Don't have an account?{' '}
            <a href="/signup" style={{ color: '#6366f1', textDecoration: 'none' }}>
              Sign up
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        .desktop-info {
          display: flex;
        }
        .mobile-info {
          display: none;
        }
        @media (max-width: 768px) {
          .desktop-info {
            display: none !important;
          }
          .mobile-info {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  )
}