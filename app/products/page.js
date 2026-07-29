'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { getValidUrl } from '@/lib/utils'

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState([])
  const [displayedProducts, setDisplayedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [visibleCount, setVisibleCount] = useState(40)
  const supabase = createClient()

  useEffect(() => {
    const fetchProducts = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('products')
        .select('*, categories(name, color)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setAllProducts(data)
        setDisplayedProducts(data.slice(0, 40))
      }
      setLoading(false)
    }
    fetchProducts()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (!error) {
      setAllProducts(allProducts.filter(p => p.id !== id))
      setDisplayedProducts(displayedProducts.filter(p => p.id !== id))
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await fetch('/api/medals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        })
      }
    }
  }

  const handleShowMore = () => {
    const nextCount = visibleCount + 40
    setDisplayedProducts(allProducts.slice(0, nextCount))
    setVisibleCount(nextCount)
  }

  const filteredProducts = allProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.description?.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  const filteredDisplayed = displayedProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.description?.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  const hasMore = visibleCount < allProducts.length && filteredProducts.length > displayedProducts.length

  if (loading) {
    return (
      <Sidebar>
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '40px' }}>
          <p style={{ color: '#a1a1b9' }}>Loading products...</p>
        </div>
      </Sidebar>
    )
  }

  const Icons = {
    Plus: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor"/>
        <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor"/>
      </svg>
    ),
    Search: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="11" cy="11" r="8" stroke="currentColor"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor"/>
      </svg>
    ),
    Edit: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor"/>
      </svg>
    ),
    Trash: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <polyline points="3 6 5 6 21 6" stroke="currentColor"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor"/>
      </svg>
    ),
    External: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor"/>
        <polyline points="15 3 21 3 21 9" stroke="currentColor"/>
        <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor"/>
      </svg>
    ),
    Empty: () => (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#a1a1b9" strokeWidth="1.5">
        <path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z" stroke="currentColor"/>
        <polyline points="2.32 6.16 12 11 21.68 6.16" stroke="currentColor"/>
        <line x1="12" y1="22.76" x2="12" y2="11" stroke="currentColor"/>
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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f1f1' }}>Products</h1>
            <p style={{ color: '#a1a1b9' }}>Manage all your builds</p>
          </div>
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

        {/* Search + View Toggle */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          marginBottom: '24px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#a1a1b9',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Icons.Search />
            </div>
            <input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                background: '#0a0a0f',
                border: '1px solid #2a2a3e',
                borderRadius: '8px',
                color: '#f1f1f1',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '6px', 
            background: '#0a0a0f', 
            borderRadius: '8px', 
            padding: '4px', 
            border: '1px solid #2a2a3e',
            flexShrink: 0
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

        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          <div style={{
            background: '#14141e',
            border: '1px solid #2a2a3e',
            borderRadius: '14px',
            padding: '60px 20px',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '16px', color: '#a1a1b9' }}>
              <Icons.Empty />
            </div>
            <h2 style={{ color: '#f1f1f1', fontSize: '20px', marginBottom: '8px' }}>
              {search ? 'No products match your search' : 'No products yet'}
            </h2>
            <p style={{ color: '#a1a1b9', marginBottom: '20px' }}>
              {search 
                ? 'Try adjusting your search'
                : 'Start documenting your builds and add your first product'
              }
            </p>
            {!search && (
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
                  fontSize: '14px'
                }}
              >
                <Icons.Plus /> Add Product
              </Link>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {filteredDisplayed.map((product) => {
                const categoryColor = product.categories?.color || '#6366f1'
                const categoryName = product.categories?.name || 'Uncategorized'
                
                return (
                  <div
                    key={product.id}
                    style={{
                      background: '#14141e',
                      border: '1px solid #2a2a3e',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a3e'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {product.thumbnail_url && (
                      <img 
                        src={product.thumbnail_url} 
                        alt={product.name}
                        style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                      />
                    )}
                    <div style={{ padding: '16px' }}>
                      <Link 
                        href={`/products/${product.id}`}
                        style={{
                          color: '#f1f1f1',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '16px',
                          display: 'block',
                          marginBottom: '4px',
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#6366f1'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#f1f1f1'}
                      >
                        {product.name}
                      </Link>
                      <p style={{ fontSize: '14px', color: '#a1a1b9', margin: '0 0 8px' }}>
                        {product.description?.slice(0, 60)}...
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
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
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {product.website_url && (
                            <a 
                              href={getValidUrl(product.website_url)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                color: '#a1a1b9',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = '#f1f1f1'; e.currentTarget.style.background = '#1c1c2e'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1b9'; e.currentTarget.style.background = 'transparent'; }}
                            >
                              <Icons.External />
                            </a>
                          )}
                          <Link
                            href={`/products/${product.id}/edit`}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              color: '#a1a1b9',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              textDecoration: 'none'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#f1f1f1'; e.currentTarget.style.background = '#1c1c2e'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1b9'; e.currentTarget.style.background = 'transparent'; }}
                          >
                            <Icons.Edit />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              color: '#a1a1b9',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#1c1c2e'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1b9'; e.currentTarget.style.background = 'transparent'; }}
                          >
                            <Icons.Trash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {hasMore && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '24px'
              }}>
                <button
                  onClick={handleShowMore}
                  style={{
                    padding: '8px 24px',
                    background: 'transparent',
                    border: '1px solid #333333',
                    borderRadius: '20px',
                    color: '#888888',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#6366f1'
                    e.currentTarget.style.color = '#ffffff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#333333'
                    e.currentTarget.style.color = '#888888'
                  }}
                >
                  Show More
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredDisplayed.map((product) => {
                const categoryColor = product.categories?.color || '#6366f1'
                const categoryName = product.categories?.name || 'Uncategorized'
                
                return (
                  <div
                    key={product.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      background: '#14141e',
                      border: '1px solid #2a2a3e',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      transition: 'all 0.2s',
                      flexWrap: 'wrap'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2a2a3e'}
                  >
                    {product.thumbnail_url ? (
                      <img 
                        src={product.thumbnail_url} 
                        alt={product.name}
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          objectFit: 'cover', 
                          borderRadius: '8px',
                          flexShrink: 0
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        background: '#0a0a0f',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#a1a1b9',
                        fontSize: '20px',
                        flexShrink: 0
                      }}>
                        📦
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: '120px' }}>
                      <Link 
                        href={`/products/${product.id}`}
                        style={{
                          color: '#f1f1f1',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '15px',
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#6366f1'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#f1f1f1'}
                      >
                        {product.name}
                      </Link>
                      <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        alignItems: 'center',
                        marginTop: '2px',
                        flexWrap: 'wrap'
                      }}>
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
                        {product.tags && product.tags.length > 0 && (
                          <span style={{ fontSize: '13px', color: '#a1a1b9' }}>
                            {product.tags.join(', ')}
                          </span>
                        )}
                        <span style={{ fontSize: '13px', color: '#a1a1b9' }}>
                          {new Date(product.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      {product.website_url && (
                        <a 
                          href={getValidUrl(product.website_url)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            color: '#a1a1b9',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#f1f1f1'; e.currentTarget.style.background = '#1c1c2e'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1b9'; e.currentTarget.style.background = 'transparent'; }}
                        >
                          <Icons.External />
                        </a>
                      )}
                      <Link
                        href={`/products/${product.id}/edit`}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          color: '#a1a1b9',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#f1f1f1'; e.currentTarget.style.background = '#1c1c2e'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1b9'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <Icons.Edit />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          color: '#a1a1b9',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#1c1c2e'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1b9'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
            {hasMore && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '24px'
              }}>
                <button
                  onClick={handleShowMore}
                  style={{
                    padding: '8px 24px',
                    background: 'transparent',
                    border: '1px solid #333333',
                    borderRadius: '20px',
                    color: '#888888',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#6366f1'
                    e.currentTarget.style.color = '#ffffff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#333333'
                    e.currentTarget.style.color = '#888888'
                  }}
                >
                  Show More
                </button>
              </div>
            )}
          </>
        )}

        {/* Count */}
        {filteredProducts.length > 0 && (
          <div style={{ 
            marginTop: '16px', 
            color: '#a1a1b9', 
            fontSize: '14px',
            textAlign: 'center'
          }}>
            Showing {Math.min(filteredDisplayed.length, filteredProducts.length)} of {filteredProducts.length} products
          </div>
        )}
      </div>
    </Sidebar>
  )
}