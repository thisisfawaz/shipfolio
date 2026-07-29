'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const supabase = createClient()

  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    avgBuildTime: 'N/A',
    currentMedal: '🏅',
    medalName: 'No medals yet',
  })
  const [recentProducts, setRecentProducts] = useState([])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }
      setUser(user)

      try {
        const { data: products } = await supabase
          .from('products')
          .select('*, categories(name, color)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        const liveProducts = products?.filter(p => p.status === 'Live') || []
        const categories = new Set(products?.map(p => p.category_id).filter(Boolean) || [])

        const { data: medals } = await supabase
          .from('medals')
          .select('*')
          .eq('user_id', user.id)
          .order('tier', { ascending: false })

        const topMedal = medals?.[0]

        setStats({
          products: products?.length || 0,
          categories: categories.size,
          avgBuildTime: liveProducts.length > 0 ? '4 Days' : 'N/A',
          currentMedal: topMedal?.icon || '🏅',
          medalName: topMedal?.name || 'No medals yet',
        })

        setRecentProducts(products?.slice(0, 6) || [])
      } catch (error) {
        console.error(error)
      }

      setLoading(false)
    }
    getUser()
  }, [])

  if (loading) {
    return (
      <Sidebar>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '60vh',
          color: '#a1a1b9'
        }}>
          <p>Loading your dashboard...</p>
        </div>
      </Sidebar>
    )
  }

  const profileUrl = `/${user?.user_metadata?.username || 'profile'}`

  const Icons = {
    Package: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z" stroke="currentColor"/>
        <polyline points="2.32 6.16 12 11 21.68 6.16" stroke="currentColor"/>
        <line x1="12" y1="22.76" x2="12" y2="11" stroke="currentColor"/>
      </svg>
    ),
    Folder: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke="currentColor"/>
      </svg>
    ),
    Clock: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="12" r="10" stroke="currentColor"/>
        <polyline points="12 6 12 12 16 14" stroke="currentColor"/>
      </svg>
    ),
    Plus: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor"/>
        <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor"/>
      </svg>
    ),
    Eye: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor"/>
      </svg>
    ),
    Clipboard: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor"/>
        <rect x="8" y="2" width="8" height="4" rx="1" stroke="currentColor"/>
      </svg>
    ),
    TrendingUp: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="currentColor"/>
        <polyline points="17 6 23 6 23 12" stroke="currentColor"/>
      </svg>
    ),
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

  return (
    <Sidebar>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#f1f1f1' }}>Dashboard</h1>
            <p style={{ color: '#a1a1b9', margin: '4px 0 0', fontSize: '15px' }}>
              Overview of your product portfolio
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link 
              href={profileUrl}
              target="_blank"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'transparent',
                color: '#f1f1f1',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px',
                border: '1px solid #2a2a3e',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1c1c2e'; e.currentTarget.style.borderColor = '#6366f1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#2a2a3e'; }}
            >
              <Icons.Eye /> Preview
            </Link>
            
            <Link 
              href="/products/new" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: '#6366f1',
                color: 'white',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#4f46e5'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#6366f1'}
            >
              <Icons.Plus /> New Product
            </Link>
          </div>
        </header>

        {/* Shareable Link */}
        <div style={{
          background: '#14141e',
          border: '1px solid #2a2a3e',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '0' }}>
            <span style={{ color: '#a1a1b9', flexShrink: 0 }}>
              <Icons.Clipboard />
            </span>
            <div style={{ minWidth: '0' }}>
              <div style={{ fontSize: '13px', color: '#a1a1b9' }}>Shareable Link</div>
              <div style={{ 
                fontSize: '14px', 
                color: '#f1f1f1',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {typeof window !== 'undefined' && `${window.location.origin}${profileUrl}`}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              const url = `${window.location.origin}${profileUrl}`
              navigator.clipboard.writeText(url)
              alert('Link copied to clipboard!')
            }}
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
              fontSize: '13px',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#2a2a3e'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#1c1c2e'; }}
          >
            <Icons.Clipboard /> Copy
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: '#14141e',
            border: '1px solid #2a2a3e',
            borderRadius: '14px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366f1'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2a2a3e'}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#1c1c2e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6366f1'
            }}>
              <Icons.Package />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#a1a1b9', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Products</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#f1f1f1' }}>{stats.products}</div>
              <div style={{ fontSize: '12px', color: '#a1a1b9' }}>total builds</div>
            </div>
          </div>

          <div style={{
            background: '#14141e',
            border: '1px solid #2a2a3e',
            borderRadius: '14px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366f1'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2a2a3e'}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#1c1c2e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6366f1'
            }}>
              <Icons.Folder />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#a1a1b9', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Categories</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#f1f1f1' }}>{stats.categories}</div>
              <div style={{ fontSize: '12px', color: '#a1a1b9' }}>organizing builds</div>
            </div>
          </div>

          <div style={{
            background: '#14141e',
            border: '1px solid #2a2a3e',
            borderRadius: '14px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366f1'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2a2a3e'}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#1c1c2e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6366f1'
            }}>
              <Icons.Clock />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#a1a1b9', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Build Time</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#f1f1f1' }}>{stats.avgBuildTime}</div>
              <div style={{ fontSize: '12px', color: '#a1a1b9' }}>per product</div>
            </div>
          </div>

          <div style={{
            background: '#14141e',
            border: '1px solid #2a2a3e',
            borderRadius: '14px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366f1'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2a2a3e'}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#1c1c2e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px'
            }}>
              {stats.currentMedal}
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#a1a1b9', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Medal</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#f1f1f1' }}>{stats.medalName}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          background: '#14141e',
          border: '1px solid #2a2a3e',
          borderRadius: '14px',
          padding: '20px 24px',
          marginBottom: '32px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f1f1', margin: '0 0 16px' }}>Quick Actions</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px'
          }}>
            <Link href="/products/new" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: '#0a0a0f',
              border: '1px solid #2a2a3e',
              borderRadius: '10px',
              textDecoration: 'none',
              color: '#f1f1f1',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#1c1c2e'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a3e'; e.currentTarget.style.background = '#0a0a0f'; }}
            >
              <Icons.Package /> New Product
            </Link>
            <Link href="/products" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: '#0a0a0f',
              border: '1px solid #2a2a3e',
              borderRadius: '10px',
              textDecoration: 'none',
              color: '#f1f1f1',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#1c1c2e'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a3e'; e.currentTarget.style.background = '#0a0a0f'; }}
            >
              <Icons.TrendingUp /> View All
            </Link>
            <Link href="/categories" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: '#0a0a0f',
              border: '1px solid #2a2a3e',
              borderRadius: '10px',
              textDecoration: 'none',
              color: '#f1f1f1',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#1c1c2e'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a3e'; e.currentTarget.style.background = '#0a0a0f'; }}
            >
              <Icons.Folder /> Categories
            </Link>
            <Link href={profileUrl} target="_blank" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: '#0a0a0f',
              border: '1px solid #2a2a3e',
              borderRadius: '10px',
              textDecoration: 'none',
              color: '#f1f1f1',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#1c1c2e'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a3e'; e.currentTarget.style.background = '#0a0a0f'; }}
            >
              <Icons.Eye /> View Profile
            </Link>
          </div>
        </div>

        {/* Recent Products */}
        {recentProducts.length > 0 && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f1f1', margin: 0 }}>
                Recent Products
              </h3>
              <div style={{ 
                display: 'flex', 
                gap: '6px', 
                background: '#0a0a0f', 
                borderRadius: '8px', 
                padding: '4px', 
                border: '1px solid #2a2a3e'
              }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: viewMode === 'grid' ? '#6366f1' : 'transparent',
                    color: viewMode === 'grid' ? 'white' : '#a1a1b9',
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
                    background: viewMode === 'list' ? '#6366f1' : 'transparent',
                    color: viewMode === 'list' ? 'white' : '#a1a1b9',
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

            {viewMode === 'grid' ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '16px'
              }}>
                {recentProducts.map((product) => {
                  const categoryColor = product.categories?.color || '#6366f1'
                  const categoryName = product.categories?.name || 'Uncategorized'
                  
                  return (
                    <Link 
                      key={product.id} 
                      href={`/products/${product.id}`}
                      style={{
                        background: '#14141e',
                        border: '1px solid #2a2a3e',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        textDecoration: 'none',
                        color: '#f1f1f1',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a3e'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      {product.thumbnail_url && (
                        <img 
                          src={product.thumbnail_url} 
                          alt={product.name}
                          style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                        />
                      )}
                      <div style={{ padding: '16px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px' }}>{product.name}</h4>
                        <p style={{ fontSize: '14px', color: '#a1a1b9', margin: '0 0 8px' }}>
                          {product.description?.slice(0, 60)}...
                        </p>
                        <span style={{
                          display: 'inline-block',
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
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentProducts.map((product) => {
                  const categoryColor = product.categories?.color || '#6366f1'
                  const categoryName = product.categories?.name || 'Uncategorized'
                  
                  return (
                    <Link 
                      key={product.id} 
                      href={`/products/${product.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        background: '#14141e',
                        border: '1px solid #2a2a3e',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        textDecoration: 'none',
                        color: '#f1f1f1',
                        transition: 'all 0.2s',
                        flexWrap: 'wrap'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a3e'; }}
                    >
                      {product.thumbnail_url ? (
                        <img 
                          src={product.thumbnail_url} 
                          alt={product.name}
                          style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                          📦
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: '120px' }}>
                        <div style={{ fontWeight: '600' }}>{product.name}</div>
                        <div style={{ fontSize: '13px', color: '#a1a1b9' }}>{product.description?.slice(0, 60)}...</div>
                      </div>
                      <span style={{
                        fontSize: '12px',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        background: `${categoryColor}22`,
                        color: categoryColor,
                        border: `1px solid ${categoryColor}44`,
                        flexShrink: 0
                      }}>
                        {categoryName}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Sidebar>
  )
}