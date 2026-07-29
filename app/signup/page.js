'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: username,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ maxWidth: '400px', margin: '80px auto 0', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Check your email</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          We've sent you a confirmation link to {email}
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto 0', padding: '0 20px' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Start building your portfolio</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Join Shipfolio and showcase what you build.
      </p>

      <form onSubmit={handleSignup}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: 'var(--text-secondary)' }}>Username</label>
          <input
            type="text"
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="yourname"
          />
        </div>

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
            minLength={6}
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
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
        Already have an account?{' '}
        <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
          Sign in
        </a>
      </p>
    </div>
  )
}