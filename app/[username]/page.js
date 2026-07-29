'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default function PublicProfile({ params }) {
  const [profile, setProfile] = useState(null)
  const [products, setProducts] = useState([])
  const [medals, setMedals] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDark, setIsDark] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const username = typeof params === 'object' ? await params.username : params.username

      if (!username) {
        setLoading(false)
        return
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error || !profileData) {
        setLoading(false)
        return
      }

      setProfile(profileData)

      const { data: productsData } = await supabase
        .from('products')
        .select('*, categories(name, color)')
        .eq('user_id', profileData.id)
        .eq('status', 'Live')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      setProducts(productsData || [])

      const { data: medalsData } = await supabase
        .from('medals')
        .select('*')
        .eq('user_id', profileData.id)
        .order('tier', { ascending: false })

      setMedals(medalsData || [])

      setLoading(false)
    }

    fetchProfile()
  }, [params])

  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('light')
    } else {
      document.body.classList.add('light')
    }
  }, [isDark])

  const medalConfig = {
    1: { name: 'Builder', description: 'Awarded after shipping 5 products' },
    2: { name: 'Maker', description: 'Awarded after shipping 10 products' },
    3: { name: 'Maverick', description: 'Awarded after shipping 20 products' },
    4: { name: 'Architect', description: 'Awarded after shipping 35 products' },
    5: { name: 'Pioneer', description: 'Awarded after shipping 50 products' },
    6: { name: 'Visionary', description: 'Awarded after shipping 75 products' },
    7: { name: 'Legend', description: 'Awarded after shipping 100 products' },
  }

  const Icons = {
    Grid: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor"/>
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor"/>
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor"/>
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor"/>
      </svg>
    ),
    List: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor"/>
        <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor"/>
        <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor"/>
        <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor"/>
        <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor"/>
        <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor"/>
      </svg>
    ),
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: '#0a0a0f',
        color: '#a1a1b9'
      }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (!profile) {
    notFound()
  }

  const theme = {
    bg: isDark ? '#0a0a0f' : '#f8fafc',
    card: isDark ? '#14141e' : '#ffffff',
    border: isDark ? '#2a2a3e' : '#e2e8f0',
    text: isDark ? '#f1f1f1' : '#0f172a',
    textSecondary: isDark ? '#a1a1b9' : '#475569',
    primary: '#6366f1',
    hover: isDark ? '#1c1c2e' : '#f1f5f9',
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: theme.bg, 
      color: theme.text,
      transition: 'background 0.3s, color 0.3s'
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 20px' }}>
        
        {/* Theme Toggle */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
          <button
            onClick={() => setIsDark(!isDark)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: `1px solid ${theme.border}`,
              background: theme.card,
              color: theme.text,
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          {profile.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.full_name || profile.username}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: '16px',
                border: `3px solid ${theme.primary}`
              }}
            />
          ) : (
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: theme.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              color: 'white',
              margin: '0 auto 16px',
              fontWeight: '600'
            }}>
              {profile.full_name?.[0] || profile.username[0]}
            </div>
          )}

          <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '4px' }}>
            {profile.full_name || profile.username}
          </h1>

          {profile.role && (
            <p style={{ fontSize: '18px', color: theme.textSecondary, marginBottom: '8px' }}>
              {profile.role}
            </p>
          )}

          {profile.bio && (
            <p style={{ color: theme.textSecondary, maxWidth: '600px', margin: '0 auto 16px' }}>
              {profile.bio}
            </p>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ color: theme.primary, textDecoration: 'none' }}>
                🌐 Website
              </a>
            )}
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer" style={{ color: theme.primary, textDecoration: 'none' }}>
                🐙 GitHub
              </a>
            )}
            {profile.twitter_url && (
              <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" style={{ color: theme.primary, textDecoration: 'none' }}>
                🐦 Twitter
              </a>
            )}
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: theme.primary, textDecoration: 'none' }}>
                💼 LinkedIn
              </a>
            )}
          </div>

          {medals.length > 0 && (
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              marginTop: '16px'
            }}>
              {medals.map((medal) => {
                const config = medalConfig[medal.tier]
                return (
                  <div
                    key={medal.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: theme.card,
                      border: `1px solid ${theme.border}`,
                      padding: '8px 16px',
                      borderRadius: '20px',
                      cursor: 'help',
                      transition: 'all 0.2s'
                    }}
                    title={`${config?.name || medal.name}\n${config?.description || ''}\nEarned: ${new Date(medal.awarded_at).toLocaleDateString()}`}
                  >
                    <span style={{ fontSize: '20px' }}>{medal.icon}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                      {config?.name || medal.name}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Products Section with View Toggle */}
        <div style={{ marginTop: '48px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: `1px solid ${theme.border}`,
            paddingBottom: '12px',
            marginBottom: '24px'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>
              Products
            </h2>
            <div style={{ display: 'flex', gap: '6px', background: theme.card, borderRadius: '8px', padding: '4px', border: `1px solid ${theme.border}` }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: viewMode === 'grid' ? theme.primary : 'transparent',
                  color: viewMode === 'grid' ? 'white' : theme.textSecondary,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <Icons.Grid />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: viewMode === 'list' ? theme.primary : 'transparent',
                  color: viewMode === 'list' ? 'white' : theme.textSecondary,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <Icons.List />
              </button>
            </div>
          </div>

          {products.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              background: theme.card,
              borderRadius: '12px',
              border: `1px solid ${theme.border}`
            }}>
              <p style={{ color: theme.textSecondary }}>No products to showcase yet</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {products.map((product) => {
                const categoryColor = product.categories?.color || '#6366f1'
                const categoryName = product.categories?.name || 'Uncategorized'
                
                return (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    style={{
                      background: theme.card,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = `0 8px 24px rgba(99, 102, 241, 0.15)`
                      e.currentTarget.style.borderColor = theme.primary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.borderColor = theme.border
                    }}
                  >
                    {product.thumbnail_url && (
                      <img 
                        src={product.thumbnail_url} 
                        alt={product.name}
                        style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                      />
                    )}
                    <div style={{ padding: '16px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 4px' }}>
                        {product.name}
                      </h3>
                      <p style={{ fontSize: '14px', color: theme.textSecondary, margin: '0 0 8px' }}>
                        {product.description?.slice(0, 80)}...
                      </p>
                      <span style={{
                        fontSize: '12px',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        background: `${categoryColor}22`,
                        color: categoryColor,
                        border: `1px solid ${categoryColor}44`
                      }}>
                        {categoryName}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {products.map((product) => {
                const categoryColor = product.categories?.color || '#6366f1'
                const categoryName = product.categories?.name || 'Uncategorized'
                
                return (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      background: theme.card,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '12px',
                      padding: '12px 20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = theme.primary
                      e.currentTarget.style.boxShadow = `0 4px 16px rgba(99, 102, 241, 0.1)`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = theme.border
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    {product.thumbnail_url ? (
                      <img 
                        src={product.thumbnail_url} 
                        alt={product.name}
                        style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    ) : (
                      <div style={{ width: '56px', height: '56px', borderRadius: '8px', background: theme.hover, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                        📦
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '16px' }}>{product.name}</div>
                      <div style={{ fontSize: '14px', color: theme.textSecondary }}>{product.description?.slice(0, 80)}...</div>
                    </div>
                    <span style={{
                      fontSize: '12px',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      background: `${categoryColor}22`,
                      color: categoryColor,
                      border: `1px solid ${categoryColor}44`
                    }}>
                      {categoryName}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '60px', 
          paddingTop: '24px', 
          borderTop: `1px solid ${theme.border}`,
          textAlign: 'center',
          color: theme.textSecondary,
          fontSize: '14px'
        }}>
          Built with Shipfolio ⚡
        </div>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)}
          theme={theme}
          isDark={isDark}
        />
      )}
    </div>
  )
}

// ============================================================
// PRODUCT MODAL - Link next to category, text link with icon
// ============================================================
function ProductModal({ product, onClose, theme, isDark }) {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchSections = async () => {
      const { data } = await supabase
        .from('sections')
        .select('*')
        .eq('product_id', product.id)
        .eq('is_public', true)
        .order('order_index', { ascending: true })

      setSections(data || [])
      setLoading(false)
    }
    fetchSections()
  }, [product.id])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const categoryColor = product.categories?.color || '#6366f1'
  const categoryName = product.categories?.name || 'Uncategorized'

  // Helper to fix URLs - always add https:// if missing
  const getValidUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    return `https://${url}`
  }

  // External Link Icon
  const ExternalLinkIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor"/>
      <polyline points="15 3 21 3 21 9" stroke="currentColor"/>
      <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor"/>
    </svg>
  )

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={handleOverlayClick}
    >
      <div style={{
        background: theme.card,
        borderRadius: '16px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '40px',
        position: 'relative',
        border: `1px solid ${theme.border}`,
        animation: 'slideUp 0.3s ease'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: theme.textSecondary,
            transition: 'color 0.2s',
            zIndex: 10
          }}
        >
          ✕
        </button>

        {/* ===== PRODUCT HEADER: Thumbnail + Title + Category + Link ===== */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '16px',
          alignItems: 'flex-start'
        }}>
          {/* Thumbnail */}
          {product.thumbnail_url ? (
            <img 
              src={product.thumbnail_url} 
              alt={product.name}
              style={{
                width: '120px',
                height: '120px',
                objectFit: 'cover',
                borderRadius: '12px',
                flexShrink: 0
              }}
            />
          ) : (
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '12px',
              background: theme.hover,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              flexShrink: 0,
              color: theme.textSecondary
            }}>
              📦
            </div>
          )}

          {/* Title + Category + Link (all on same row) */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              margin: '0 0 8px',
              color: theme.text
            }}>
              {product.name}
            </h2>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              flexWrap: 'wrap'
            }}>
              {/* Category Badge */}
              <span style={{
                fontSize: '12px',
                padding: '2px 10px',
                borderRadius: '12px',
                background: `${categoryColor}22`,
                color: categoryColor,
                border: `1px solid ${categoryColor}44`
              }}>
                {categoryName}
              </span>

              {/* Website Link - Text link with icon, next to category */}
              {product.website_url && (
                <a
                  href={getValidUrl(product.website_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px',
                    color: theme.primary,
                    textDecoration: 'none',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <ExternalLinkIcon />
                  Visit Website
                </a>
              )}

              {/* GitHub Link - Text link with icon, next to category */}
              {product.github_url && (
                <a
                  href={getValidUrl(product.github_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px',
                    color: theme.textSecondary,
                    textDecoration: 'none',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <ExternalLinkIcon />
                  GitHub
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ===== DESCRIPTION ===== */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{ 
            fontSize: '16px', 
            color: theme.textSecondary,
            lineHeight: '1.6',
            margin: 0
          }}>
            {product.description}
          </p>
        </div>

        {/* ===== META INFO ===== */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          flexWrap: 'wrap',
          marginBottom: '20px',
          paddingBottom: '20px',
          borderBottom: `1px solid ${theme.border}`
        }}>
          {product.build_time && (
            <span style={{
              padding: '4px 12px',
              borderRadius: '20px',
              background: theme.hover,
              fontSize: '13px',
              color: theme.textSecondary
            }}>
              ⏱️ {product.build_time}
            </span>
          )}
          {product.launch_date && (
            <span style={{
              padding: '4px 12px',
              borderRadius: '20px',
              background: theme.hover,
              fontSize: '13px',
              color: theme.textSecondary
            }}>
              📅 {new Date(product.launch_date).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* ===== SECTIONS ===== */}
        {loading ? (
          <p style={{ color: theme.textSecondary }}>Loading sections...</p>
        ) : sections.length > 0 ? (
          <div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: theme.text
            }}>
              Details
            </h3>
            {sections.map((section) => (
              <div key={section.id} style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  marginBottom: '6px',
                  color: theme.text
                }}>
                  {section.title}
                </h4>
                <div style={{ 
                  fontSize: '15px', 
                  color: theme.textSecondary,
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}