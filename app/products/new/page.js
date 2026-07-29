'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { cleanUrl } from '@/lib/utils'

export default function NewProductPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    websiteUrl: '',
    categoryId: '',
    tags: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  
  // Dynamic sections
  const [sections, setSections] = useState([])
  const [showSectionForm, setShowSectionForm] = useState(false)
  const [newSection, setNewSection] = useState({ 
    title: '', 
    content: '',
    is_public: false  // Default: private
  })
  const [editingSectionId, setEditingSectionId] = useState(null)

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
    }
    fetchCategories()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddSection = () => {
    if (newSection.title.trim() && newSection.content.trim()) {
      setSections([...sections, { 
        ...newSection, 
        id: Date.now(),
        is_public: newSection.is_public || false
      }])
      setNewSection({ title: '', content: '', is_public: false })
      setShowSectionForm(false)
      setEditingSectionId(null)
    }
  }

  const handleEditSection = (id) => {
    const section = sections.find(s => s.id === id)
    if (section) {
      setNewSection({
        title: section.title,
        content: section.content,
        is_public: section.is_public || false
      })
      setEditingSectionId(id)
      setShowSectionForm(true)
    }
  }

  const handleUpdateSection = () => {
    if (newSection.title.trim() && newSection.content.trim()) {
      setSections(sections.map(s => 
        s.id === editingSectionId 
          ? { ...s, 
              title: newSection.title, 
              content: newSection.content,
              is_public: newSection.is_public || false
            }
          : s
      ))
      setNewSection({ title: '', content: '', is_public: false })
      setShowSectionForm(false)
      setEditingSectionId(null)
    }
  }

  const handleRemoveSection = (id) => {
    setSections(sections.filter(s => s.id !== id))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let thumbnailUrl = null
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `products/${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath)

        thumbnailUrl = publicUrl
      }

      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const cleanedWebsiteUrl = cleanUrl(formData.websiteUrl)

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          name: formData.name,
          slug,
          description: formData.description,
          thumbnail_url: thumbnailUrl,
          website_url: cleanedWebsiteUrl,
          status: 'Live',
          is_published: true,
          category_id: formData.categoryId || null,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        })
        .select()
        .single()

      if (productError) throw productError

      if (sections.length > 0) {
        const sectionsData = sections.map((section, index) => ({
          product_id: product.id,
          title: section.title,
          content: section.content,
          is_public: section.is_public || false,
          order_index: index,
        }))

        const { error: sectionsError } = await supabase
          .from('sections')
          .insert(sectionsData)

        if (sectionsError) throw sectionsError
      }

      await fetch('/api/medals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      router.push('/dashboard')
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const Icons = {
    ArrowLeft: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <polyline points="15 18 9 12 15 6" stroke="currentColor"/>
      </svg>
    ),
    Upload: () => (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor"/>
        <polyline points="17 8 12 3 7 8" stroke="currentColor"/>
        <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor"/>
      </svg>
    ),
    Plus: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor"/>
        <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor"/>
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
    Lock: () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor"/>
      </svg>
    ),
    Globe: () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="12" r="10" stroke="currentColor"/>
        <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor"/>
      </svg>
    ),
    Check: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" stroke="currentColor"/>
      </svg>
    ),
  }

  return (
    <Sidebar>
      <div style={{ maxWidth: '720px', margin: '0 auto', paddingBottom: '40px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <Link href="/dashboard" style={{ color: '#a1a1b9', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Icons.ArrowLeft />
          </Link>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f1f1' }}>New Product</h1>
            <p style={{ color: '#a1a1b9' }}>Document your build and add it to your portfolio</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ 
              background: '#7f1d1d', 
              color: '#fca5a5', 
              padding: '12px 16px', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          {/* Thumbnail */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#a1a1b9', fontSize: '14px' }}>Thumbnail</label>
            <div
              style={{
                border: '2px dashed #2a2a3e',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: imagePreview ? '#14141e' : 'transparent'
              }}
              onClick={() => document.getElementById('imageUpload').click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const file = e.dataTransfer.files[0]
                if (file) {
                  setImageFile(file)
                  const reader = new FileReader()
                  reader.onloadend = () => setImagePreview(reader.result)
                  reader.readAsDataURL(file)
                }
              }}
            >
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ maxHeight: '200px', borderRadius: '8px' }} />
              ) : (
                <>
                  <div style={{ color: '#a1a1b9', display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                    <Icons.Upload />
                  </div>
                  <p style={{ color: '#a1a1b9' }}>Click or drag to upload</p>
                  <p style={{ fontSize: '12px', color: '#a1a1b9', opacity: 0.6 }}>PNG, JPG or WebP</p>
                </>
              )}
            </div>
          </div>

          {/* Product Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#a1a1b9', fontSize: '14px' }}>Product Name *</label>
            <input
              name="name"
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
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., AI Resume Builder"
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#a1a1b9', fontSize: '14px' }}>Description *</label>
            <textarea
              name="description"
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
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="What does your product do?"
            />
          </div>

          {/* Live Website URL */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#a1a1b9', fontSize: '14px' }}>Live Website URL *</label>
            <input
              name="websiteUrl"
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
              value={formData.websiteUrl}
              onChange={handleChange}
              required
              placeholder="https://yourproduct.com"
            />
          </div>

          {/* Category & Tags */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#a1a1b9', fontSize: '14px' }}>Category</label>
              <select
                name="categoryId"
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
                value={formData.categoryId}
                onChange={handleChange}
              >
                <option value="">No category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#a1a1b9', fontSize: '14px' }}>Tags</label>
              <input
                name="tags"
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
                value={formData.tags}
                onChange={handleChange}
                placeholder="AI, SaaS, Tool (comma separated)"
              />
            </div>
          </div>

          {/* Add Section Button */}
          <div style={{ marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => {
                setShowSectionForm(!showSectionForm)
                if (!showSectionForm) {
                  setEditingSectionId(null)
                  setNewSection({ title: '', content: '', is_public: false })
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'transparent',
                color: '#6366f1',
                border: '1px solid #2a2a3e',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: 'inherit',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1c1c2e'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Icons.Plus /> Add section
            </button>
          </div>

          {/* Add Section Form */}
          {showSectionForm && (
            <div style={{
              background: '#14141e',
              border: '1px solid #2a2a3e',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '12px'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', color: '#a1a1b9', fontSize: '13px' }}>Title</label>
                <input
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#0a0a0f',
                    border: '1px solid #2a2a3e',
                    borderRadius: '6px',
                    color: '#f1f1f1',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                  value={newSection.title}
                  onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                  placeholder="e.g., Challenge, Solution, Process"
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', color: '#a1a1b9', fontSize: '13px' }}>Content</label>
                <textarea
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#0a0a0f',
                    border: '1px solid #2a2a3e',
                    borderRadius: '6px',
                    color: '#f1f1f1',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                  value={newSection.content}
                  onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                  placeholder="Describe this section..."
                />
              </div>
              {/* Public/Private Toggle */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', color: '#a1a1b9', fontSize: '13px' }}>Visibility</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#a1a1b9', fontSize: '13px' }}>
                    <input
                      type="radio"
                      name="visibility"
                      checked={!newSection.is_public}
                      onChange={() => setNewSection({ ...newSection, is_public: false })}
                      style={{ accentColor: '#6366f1' }}
                    />
                    <Icons.Lock /> Private
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#a1a1b9', fontSize: '13px' }}>
                    <input
                      type="radio"
                      name="visibility"
                      checked={newSection.is_public}
                      onChange={() => setNewSection({ ...newSection, is_public: true })}
                      style={{ accentColor: '#6366f1' }}
                    />
                    <Icons.Globe /> Public
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={editingSectionId !== null ? handleUpdateSection : handleAddSection}
                  style={{
                    padding: '6px 16px',
                    background: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontFamily: 'inherit'
                  }}
                >
                  {editingSectionId !== null ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSectionForm(false)
                    setEditingSectionId(null)
                    setNewSection({ title: '', content: '', is_public: false })
                  }}
                  style={{
                    padding: '6px 16px',
                    background: 'transparent',
                    color: '#a1a1b9',
                    border: '1px solid #2a2a3e',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontFamily: 'inherit'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* List of added sections */}
          {sections.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {sections.map((section) => (
                <div
                  key={section.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#0a0a0f',
                    border: '1px solid #2a2a3e',
                    borderRadius: '8px',
                    padding: '10px 14px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#f1f1f1', fontSize: '14px', fontWeight: '500' }}>{section.title}</span>
                      <span style={{ 
                        fontSize: '10px', 
                        padding: '1px 8px', 
                        borderRadius: '10px',
                        background: section.is_public ? '#1e3a1e' : '#3a1e1e',
                        color: section.is_public ? '#4ade80' : '#f87171'
                      }}>
                        {section.is_public ? 'Public' : 'Private'}
                      </span>
                    </div>
                    <div style={{ color: '#a1a1b9', fontSize: '13px' }}>{section.content.slice(0, 60)}...</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => handleEditSection(section.id)}
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
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#f1f1f1'; e.currentTarget.style.background = '#1c1c2e'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1b9'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Icons.Edit />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(section.id)}
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

          {/* Add Product Button */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 24px',
                background: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#4f46e5'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#6366f1'}
            >
              {loading ? 'Creating...' : 'Add Product'}
            </button>
            
            <Link
              href="/dashboard"
              style={{
                padding: '10px 24px',
                background: 'transparent',
                color: '#a1a1b9',
                border: '1px solid #2a2a3e',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1c1c2e'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </Sidebar>
  )
}