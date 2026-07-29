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
    <div style={{ maxWidth: '400px', margin: '80px auto 0', padding: '0 20px' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Welcome back</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Sign in to your Shipfolio account.
      </p>

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: 'var(--text-secondary)' }}>Email</label>
          <input
            type="email"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '14px',
              color: 'var(--text)',
              fontFamily: 'inherit'
            }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: 'var(--text-secondary)' }}>Password</label>
          <input
            type="password"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '14px',
              color: 'var(--text)',
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
            background: 'var(--primary)',
            color: 'white',
            borderRadius: '10px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.2s'
          }}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
        Don't have an account?{' '}
        <a href="/signup" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
          Sign up
        </a>
      </p>
    </div>
  )
}