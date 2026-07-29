'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { getValidUrl } from '@/lib/utils'

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id
  const supabase = createClient()
  
  const [product, setProduct] = useState(null)
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState(null)

  useEffect(() => {
    const fetchProduct = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*, categories(name, color)')
        .eq('id', productId)
        .eq('user_id', user.id)
        .single()

      if (productError || !productData) {
        router.push('/products')
        return
      }

      setProduct(productData)

      const { data: sectionsData } = await supabase
        .from('sections')
        .select('*')
        .eq('product_id', productId)
        .order('order_index', { ascending: true })

      if (sectionsData) setSections(sectionsData)

      setLoading(false)
    }

    fetchProduct()
  }, [productId])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (!error) {
      router.push('/products')
    }
  }

  if (loading) {
    return (
      <Sidebar>
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
          <p style={{ color: '#a1a1b9' }}>Loading...</p>
        </div>
      </Sidebar>
    )
  }

  if (!product) {
    return null
  }

  const Icons = {
    ArrowLeft: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <polyline points="15 18 9 12 15 6" stroke="currentColor"/>
      </svg>
    ),
    Edit: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor"/>
      </svg>
    ),
    External: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor"/>
        <polyline points="15 3 21 3 21 9" stroke="currentColor"/>
        <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor"/>
      </svg>
    ),
    Github: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor"/>
      </svg>
    ),
    Lock: () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor"/>
      </svg>
    ),
    Trash: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <polyline points="3 6 5 6 21 6" stroke="currentColor"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor"/>
      </svg>
    ),
  }

  const statusColors = {
    Idea: { bg: '#1c1c2e', color: '#a1a1b9' },
    Building: { bg: '#1e3a5f', color: '#60a5fa' },
    Testing: { bg: '#1e3a3a', color: '#34d399' },
    Live: { bg: '#1e3a1e', color: '#4ade80' },
    Archived: { bg: '#3a1e1e', color: '#f87171' },
  }

  const statusStyle = statusColors[product.status] || statusColors.Idea
  const categoryColor = product.categories?.color || '#6366f1'
  const categoryName = product.categories?.name || 'Uncategorized'

  return (
    <Sidebar>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Back Button */}
        <Link 
          href="/products" 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#a1a1b9',
            textDecoration: 'none',
            marginBottom: '24px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#f1f1f1'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1b9'}
        >
          <Icons.ArrowLeft /> Back to Products
        </Link>

        {/* Product Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f1f1' }}>
                {product.name}
              </h1>
              <span style={{ 
                fontSize: '12px', 
                padding: '4px 12px', 
                borderRadius: '12px',
                background: statusStyle.bg,
                color: statusStyle.color,
                fontWeight: '500'
              }}>
                {product.status}
              </span>
            </div>
            <p style={{ color: '#a1a1b9', marginTop: '4px' }}>
              {product.description}
            </p>
          </div>
          <Link
            href={`/products/${product.id}/edit`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: '#1c1c2e',
              border: '1px solid #2a2a3e',
              borderRadius: '8px',
              color: '#f1f1f1',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#2a2a3e'; e.currentTarget.style.borderColor = '#6366f1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#1c1c2e'; e.currentTarget.style.borderColor = '#2a2a3e'; }}
          >
            <Icons.Edit /> Edit
          </Link>
        </div>

        {/* Product Meta */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          marginTop: '20px',
          padding: '16px 20px',
          background: '#14141e',
          border: '1px solid #2a2a3e',
          borderRadius: '12px'
        }}>
          {/* Category */}
          <div>
            <div style={{ fontSize: '12px', color: '#a1a1b9', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</div>
            <div style={{ 
              color: '#f1f1f1', 
              fontSize: '14px', 
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                borderRadius: '3px',
                background: categoryColor
              }} />
              {categoryName}
            </div>
          </div>

          {/* Build Time */}
          <div>
            <div style={{ fontSize: '12px', color: '#a1a1b9', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Build Time</div>
            <div style={{ color: '#f1f1f1', fontSize: '14px', fontWeight: '500' }}>
              {product.build_time || 'N/A'}
            </div>
          </div>

          {/* Launch Date */}
          <div>
            <div style={{ fontSize: '12px', color: '#a1a1b9', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Launch Date</div>
            <div style={{ color: '#f1f1f1', fontSize: '14px', fontWeight: '500' }}>
              {product.launch_date ? new Date(product.launch_date).toLocaleDateString() : 'N/A'}
            </div>
          </div>

          {/* Created */}
          <div>
            <div style={{ fontSize: '12px', color: '#a1a1b9', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created</div>
            <div style={{ color: '#f1f1f1', fontSize: '14px', fontWeight: '500' }}>
              {new Date(product.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '12px', color: '#a1a1b9', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Tags</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {product.tags.map((tag) => (
                <span key={tag} style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  background: '#1c1c2e',
                  color: '#a1a1b9',
                  fontSize: '13px'
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {(product.website_url || product.github_url) && (
          <div style={{ 
            marginTop: '20px', 
            display: 'flex', 
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {product.website_url && (
              <a
                href={getValidUrl(product.website_url)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: '#6366f1',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#4f46e5'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#6366f1'}
              >
                <Icons.External /> Visit Website
              </a>
            )}
            {product.github_url && (
              <a
                href={getValidUrl(product.github_url)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: '#1c1c2e',
                  color: '#f1f1f1',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: '1px solid #2a2a3e',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#2a2a3e'; e.currentTarget.style.borderColor = '#6366f1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#1c1c2e'; e.currentTarget.style.borderColor = '#2a2a3e'; }}
              >
                <Icons.Github /> View GitHub
              </a>
            )}
          </div>
        )}

        {/* Sections */}
        {sections.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#f1f1f1',
              borderBottom: '1px solid #2a2a3e',
              paddingBottom: '12px',
              marginBottom: '20px'
            }}>
              Sections
            </h2>
            {sections.map((section) => (
              <div key={section.id} style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f1f1', margin: 0 }}>
                    {section.title}
                  </h3>
                  {!section.is_public && (
                    <span style={{ 
                      fontSize: '11px', 
                      color: '#f87171', 
                      background: '#3a1e1e',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Icons.Lock /> Private
                    </span>
                  )}
                </div>
                <div style={{ 
                  color: '#a1a1b9', 
                  lineHeight: '1.6', 
                  whiteSpace: 'pre-wrap',
                  marginTop: '4px'
                }}>
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Button */}
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #2a2a3e' }}>
          <button
            onClick={handleDelete}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              color: '#ef4444',
              border: '1px solid #2a2a3e',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#3a1e1e'; e.currentTarget.style.borderColor = '#ef4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#2a2a3e'; }}
          >
            <Icons.Trash /> Delete Product
          </button>
        </div>
      </div>
    </Sidebar>
  )
}