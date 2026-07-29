'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [newCategory, setNewCategory] = useState('')
  const [selectedColor, setSelectedColor] = useState('#6366f1')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchCategories = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (data) setCategories(data)
      setLoading(false)
    }
    fetchCategories()
  }, [])

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategory.trim()) return

    setAdding(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const slug = newCategory
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name: newCategory.trim(),
        slug,
        color: selectedColor,
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
    } else {
      setCategories([...categories, data])
      setNewCategory('')
      setSelectedColor('#6366f1')
    }
    setAdding(false)
  }

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (!error) {
      setCategories(categories.filter(c => c.id !== id))
    }
  }

  const handleColorChange = async (id, color) => {
    const { error } = await supabase
      .from('categories')
      .update({ color })
      .eq('id', id)

    if (!error) {
      setCategories(categories.map(c => c.id === id ? { ...c, color } : c))
    }
  }

  if (loading) {
    return (
      <Sidebar>
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
          <p style={{ color: '#a1a1b9' }}>Loading categories...</p>
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
    Trash: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <polyline points="3 6 5 6 21 6" stroke="currentColor"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor"/>
      </svg>
    ),
    Empty: () => (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#a1a1b9" strokeWidth="1.5">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke="currentColor"/>
      </svg>
    ),
  }

  return (
    <Sidebar>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f1f1' }}>Categories</h1>
          <p style={{ color: '#a1a1b9' }}>Organize your products with categories</p>
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} style={{ marginBottom: '32px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name..."
              style={{
                flex: 1,
                minWidth: '180px',
                padding: '10px 14px',
                background: '#0a0a0f',
                border: '1px solid #2a2a3e',
                borderRadius: '8px',
                color: '#f1f1f1',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
              disabled={adding}
            />
            
            {/* Color Spectrum Picker */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              flexShrink: 0
            }}>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                style={{
                  width: '44px',
                  height: '44px',
                  padding: '2px',
                  background: '#0a0a0f',
                  border: '2px solid #2a2a3e',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2a2a3e'}
              />
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                background: selectedColor,
                border: '1px solid #2a2a3e',
                flexShrink: 0
              }} />
            </div>

            <button
              type="submit"
              disabled={adding || !newCategory.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 20px',
                background: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
                opacity: adding || !newCategory.trim() ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) e.currentTarget.style.background = '#4f46e5'
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) e.currentTarget.style.background = '#6366f1'
              }}
            >
              <Icons.Plus /> Add Category
            </button>
          </div>
          {error && (
            <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>
              {error}
            </div>
          )}
        </form>

        {/* Categories List */}
        {categories.length === 0 ? (
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
            <h2 style={{ color: '#f1f1f1', fontSize: '18px', marginBottom: '8px' }}>No categories yet</h2>
            <p style={{ color: '#a1a1b9' }}>Create your first category to organize your products</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '12px'
          }}>
            {categories.map((category) => (
              <div
                key={category.id}
                style={{
                  background: '#14141e',
                  border: '1px solid #2a2a3e',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2a2a3e'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    background: category.color || '#6366f1',
                    flexShrink: 0
                  }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ 
                      color: '#f1f1f1', 
                      fontSize: '15px', 
                      fontWeight: '500',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {category.name}
                    </div>
                    <div style={{ color: '#a1a1b9', fontSize: '12px' }}>
                      /{category.slug}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                  {/* Color Spectrum Picker for existing category */}
                  <input
                    type="color"
                    value={category.color || '#6366f1'}
                    onChange={(e) => handleColorChange(category.id, e.target.value)}
                    style={{
                      width: '32px',
                      height: '32px',
                      padding: '2px',
                      background: '#0a0a0f',
                      border: '1px solid #2a2a3e',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2a2a3e'}
                  />
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      color: '#a1a1b9',
                      transition: 'all 0.2s',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#1c1c2e'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1b9'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Icons.Trash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Count */}
        {categories.length > 0 && (
          <div style={{ 
            marginTop: '16px', 
            color: '#a1a1b9', 
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {categories.length} {categories.length === 1 ? 'category' : 'categories'}
          </div>
        )}
      </div>
    </Sidebar>
  )
}