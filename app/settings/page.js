'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { cleanUrl } from '@/lib/utils'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    role: '',
    bio: '',
    location: '',
    website: '',
    github_url: '',
    twitter_url: '',
    linkedin_url: '',
    avatar_url: '',
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          username: data.username || '',
          role: data.role || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          github_url: data.github_url || '',
          twitter_url: data.twitter_url || '',
          linkedin_url: data.linkedin_url || '',
          avatar_url: data.avatar_url || '',
        })
        if (data.avatar_url) {
          setAvatarPreview(data.avatar_url)
        }
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let avatarUrl = profile.avatar_url
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `avatar-${Date.now()}.${fileExt}`
        const filePath = `avatars/${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        avatarUrl = publicUrl
      }

      // Clean URLs before saving - adds https:// if missing
      const cleanedWebsite = cleanUrl(profile.website)
      const cleanedGithub = cleanUrl(profile.github_url)
      const cleanedTwitter = cleanUrl(profile.twitter_url)
      const cleanedLinkedin = cleanUrl(profile.linkedin_url)

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          username: profile.username,
          role: profile.role,
          bio: profile.bio,
          location: profile.location,
          website: cleanedWebsite,
          github_url: cleanedGithub,
          twitter_url: cleanedTwitter,
          linkedin_url: cleanedLinkedin,
          avatar_url: avatarUrl,
        })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setProfile(prev => ({ ...prev, avatar_url: avatarUrl }))
      setAvatarFile(null)
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <Sidebar>
        <div style={{ maxWidth: '640px', margin: '0 auto', paddingTop: '40px' }}>
          <p style={{ color: '#a1a1b9' }}>Loading settings...</p>
        </div>
      </Sidebar>
    )
  }

  const Icons = {
    Upload: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor"/>
        <polyline points="17 8 12 3 7 8" stroke="currentColor"/>
        <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor"/>
      </svg>
    ),
    Website: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="12" r="10" stroke="currentColor"/>
        <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor"/>
      </svg>
    ),
    Github: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor"/>
      </svg>
    ),
    Twitter: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" stroke="currentColor"/>
      </svg>
    ),
    LinkedIn: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" stroke="currentColor"/>
        <rect x="2" y="9" width="4" height="12" stroke="currentColor"/>
        <circle cx="4" cy="4" r="2" stroke="currentColor"/>
      </svg>
    ),
    Location: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor"/>
        <circle cx="12" cy="10" r="3" stroke="currentColor"/>
      </svg>
    ),
    User: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor"/>
        <circle cx="12" cy="7" r="4" stroke="currentColor"/>
      </svg>
    ),
  }

  return (
    <Sidebar>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f1f1' }}>Settings</h1>
          <p style={{ color: '#a1a1b9' }}>Update your public profile and social links</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Message */}
          {message && (
            <div style={{ 
              padding: '12px 16px', 
              borderRadius: '8px',
              marginBottom: '20px',
              background: message.type === 'success' ? '#064e3b' : '#7f1d1d',
              color: message.type === 'success' ? '#86efac' : '#fca5a5'
            }}>
              {message.text}
            </div>
          )}

          {/* Avatar */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#a1a1b9', fontSize: '14px' }}>Profile Photo</label>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: '#0a0a0f',
                  border: '2px solid #2a2a3e',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '32px', color: '#a1a1b9' }}>
                    {profile.full_name?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <label
                  htmlFor="avatarUpload"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: '#1c1c2e',
                    border: '1px solid #2a2a3e',
                    borderRadius: '8px',
                    color: '#f1f1f1',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a3e'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#1c1c2e'}
                >
                  <Icons.Upload />
                  Upload
                </label>
                <input
                  id="avatarUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                {profile.avatar_url && !avatarFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarPreview(null)
                      setProfile(prev => ({ ...prev, avatar_url: '' }))
                    }}
                    style={{
                      padding: '6px 16px',
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#a1a1b9', fontSize: '14px' }}>
              <Icons.User /> Full Name
            </label>
            <input
              name="full_name"
              value={profile.full_name}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#0a0a0f',
                border: '1px solid #2a2a3e',
                borderRadius: '8px',
                color: '#f1f1f1',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
              placeholder="Your full name"
            />
          </div>

          {/* Username */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#a1a1b9', fontSize: '14px' }}>Username</label>
            <input
              name="username"
              value={profile.username}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#0a0a0f',
                border: '1px solid #2a2a3e',
                borderRadius: '8px',
                color: '#f1f1f1',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
              placeholder="your-username"
            />
            <div style={{ fontSize: '12px', color: '#a1a1b9', marginTop: '4px' }}>
              Your public profile URL: /{profile.username || 'username'}
            </div>
          </div>

          {/* Role */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#a1a1b9', fontSize: '14px' }}>Role</label>
            <input
              name="role"
              value={profile.role}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#0a0a0f',
                border: '1px solid #2a2a3e',
                borderRadius: '8px',
                color: '#f1f1f1',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
              placeholder="e.g., Product Builder, Indie Hacker"
            />
          </div>

          {/* Bio */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#a1a1b9', fontSize: '14px' }}>Bio</label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows="4"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#0a0a0f',
                border: '1px solid #2a2a3e',
                borderRadius: '8px',
                color: '#f1f1f1',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                minHeight: '100px'
              }}
              placeholder="Tell people about yourself..."
            />
          </div>

          {/* Location */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#a1a1b9', fontSize: '14px' }}>
              <Icons.Location /> Location
            </label>
            <input
              name="location"
              value={profile.location}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#0a0a0f',
                border: '1px solid #2a2a3e',
                borderRadius: '8px',
                color: '#f1f1f1',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
              placeholder="e.g., San Francisco, CA"
            />
          </div>

          {/* Social Links */}
          <div style={{ 
            borderTop: '1px solid #2a2a3e', 
            paddingTop: '24px', 
            marginTop: '8px',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f1f1', marginBottom: '16px' }}>
              Social Links
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', color: '#a1a1b9', fontSize: '13px' }}>
                <Icons.Website /> Website
              </label>
              <input
                name="website"
                value={profile.website}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#0a0a0f',
                  border: '1px solid #2a2a3e',
                  borderRadius: '8px',
                  color: '#f1f1f1',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', color: '#a1a1b9', fontSize: '13px' }}>
                <Icons.Github /> GitHub
              </label>
              <input
                name="github_url"
                value={profile.github_url}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#0a0a0f',
                  border: '1px solid #2a2a3e',
                  borderRadius: '8px',
                  color: '#f1f1f1',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
                placeholder="https://github.com/username"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', color: '#a1a1b9', fontSize: '13px' }}>
                <Icons.Twitter /> Twitter / X
              </label>
              <input
                name="twitter_url"
                value={profile.twitter_url}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#0a0a0f',
                  border: '1px solid #2a2a3e',
                  borderRadius: '8px',
                  color: '#f1f1f1',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
                placeholder="https://twitter.com/username"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', color: '#a1a1b9', fontSize: '13px' }}>
                <Icons.LinkedIn /> LinkedIn
              </label>
              <input
                name="linkedin_url"
                value={profile.linkedin_url}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#0a0a0f',
                  border: '1px solid #2a2a3e',
                  borderRadius: '8px',
                  color: '#f1f1f1',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '10px 24px',
                background: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: saving ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) e.currentTarget.style.background = '#4f46e5'
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) e.currentTarget.style.background = '#6366f1'
              }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </Sidebar>
  )
}