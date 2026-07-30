'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/Sidebar'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Sortable Item Component
function SortableIdea({ idea, onToggle, onDelete, onEdit, index }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: idea.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 16px',
    borderBottom: '1px solid #1c1c2e',
    background: isDragging ? '#1c1c2e' : 'transparent',
    cursor: 'grab',
    transition: 'background 0.2s',
    touchAction: 'none',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* Drag Handle */}
      <div 
        {...listeners} 
        style={{ 
          color: '#666666',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px 6px',
          minWidth: '28px',
          minHeight: '36px',
          flexShrink: 0,
          touchAction: 'none',
          borderRadius: '6px',
          fontSize: '20px',
          lineHeight: 1,
          letterSpacing: '-2px',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
        onTouchStart={(e) => {
          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.background = 'transparent'
        }}
      >
        <span style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1px',
          fontWeight: '300'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ transform: 'rotate(90deg)' }}>
            <circle cx="6" cy="6" r="2.5"/>
            <circle cx="6" cy="12" r="2.5"/>
            <circle cx="6" cy="18" r="2.5"/>
            <circle cx="14" cy="6" r="2.5"/>
            <circle cx="14" cy="12" r="2.5"/>
            <circle cx="14" cy="18" r="2.5"/>
          </svg>
        </span>
      </div>

      {/* Clickable Box - Toggles completed */}
      <div
        onClick={() => onToggle(idea.id, idea.completed)}
        style={{
          width: '22px',
          height: '22px',
          minWidth: '22px',
          borderRadius: '6px',
          border: `2px solid ${idea.completed ? '#4ade80' : '#2a2a3e'}`,
          background: idea.completed ? '#4ade80' : 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}
      >
        {idea.completed && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" stroke="currentColor"/>
          </svg>
        )}
      </div>

      {/* Editable Idea Text */}
      <span
        onClick={() => onEdit(idea.id, idea.text)}
        style={{
          flex: 1,
          fontSize: '15px',
          color: idea.completed ? '#666666' : '#f1f1f1',
          textDecoration: idea.completed ? 'line-through' : 'none',
          transition: 'color 0.2s',
          cursor: 'text',
          padding: '2px 4px',
          borderRadius: '4px'
        }}
        onMouseEnter={(e) => {
          if (!idea.completed) e.currentTarget.style.background = '#1c1c2e'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
        }}
      >
        {idea.text}
      </span>

      {/* Status Badge */}
      <span style={{
        fontSize: '11px',
        padding: '2px 10px',
        borderRadius: '12px',
        background: idea.completed ? '#1e3a1e' : '#3a1e1e',
        color: idea.completed ? '#4ade80' : '#f87171',
        fontWeight: '500',
        flexShrink: 0
      }}>
        {idea.completed ? 'Completed' : 'Pending'}
      </span>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(idea.id)}
        style={{
          padding: '6px',
          borderRadius: '6px',
          background: 'none',
          border: 'none',
          color: '#444444',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.2s',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#ef4444'
          e.currentTarget.style.background = '#1c1c2e'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#444444'
          e.currentTarget.style.background = 'transparent'
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <polyline points="3 6 5 6 21 6" stroke="currentColor"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor"/>
        </svg>
      </button>
    </div>
  )
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [newIdeaText, setNewIdeaText] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [textareaHeight, setTextareaHeight] = useState('60px')
  const textareaRef = useRef(null)
  const editInputRef = useRef(null)
  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchIdeas()
  }, [])

  const fetchIdeas = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('product_ideas')
      .select('*')
      .eq('user_id', user.id)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true })

    if (data) setIdeas(data)
    setLoading(false)
  }

  const handleAddIdeas = async (e) => {
    e.preventDefault()
    const text = newIdeaText.trim()
    if (!text) return

    const lines = text.split('\n').filter(line => line.trim() !== '')
    if (lines.length === 0) return

    setAdding(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const newIdeas = lines.map((line, index) => ({
      user_id: user.id,
      text: line.trim(),
      order_index: ideas.length + index,
    }))

    const { data, error } = await supabase
      .from('product_ideas')
      .insert(newIdeas)
      .select()

    if (!error && data) {
      setIdeas([...ideas, ...data])
      setNewIdeaText('')
      setTextareaHeight('60px')
    } else {
      console.error('Error adding ideas:', error)
    }
    setAdding(false)
    textareaRef.current?.focus()
  }

  const handleToggleCompleted = async (id, completed) => {
    const { error } = await supabase
      .from('product_ideas')
      .update({ completed: !completed })
      .eq('id', id)

    if (!error) {
      setIdeas(ideas.map(idea =>
        idea.id === id ? { ...idea, completed: !completed } : idea
      ))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this idea?')) return

    const { error } = await supabase
      .from('product_ideas')
      .delete()
      .eq('id', id)

    if (!error) {
      setIdeas(ideas.filter(idea => idea.id !== id))
    }
  }

  const handleStartEdit = (id, text) => {
    setEditingId(id)
    setEditingText(text)
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus()
        editInputRef.current.select()
      }
    }, 50)
  }

  const handleSaveEdit = async (id) => {
    const text = editingText.trim()
    if (!text) {
      setEditingId(null)
      return
    }

    const { error } = await supabase
      .from('product_ideas')
      .update({ text: text })
      .eq('id', id)

    if (!error) {
      setIdeas(ideas.map(idea =>
        idea.id === id ? { ...idea, text: text } : idea
      ))
    }
    setEditingId(null)
  }

  const handleKeyDownEdit = (e, id) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveEdit(id)
    }
    if (e.key === 'Escape') {
      setEditingId(null)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const textarea = e.target
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const value = textarea.value
      textarea.value = value.substring(0, start) + '\n' + value.substring(end)
      setNewIdeaText(textarea.value)
      textarea.selectionStart = textarea.selectionEnd = start + 1
      
      updateTextareaHeight(textarea)
    }
  }

  const handleTextareaChange = (e) => {
    const textarea = e.target
    setNewIdeaText(textarea.value)
    updateTextareaHeight(textarea)
  }

  // FIX: Auto-expand with one empty line below (scrollHeight + lineHeight)
  const updateTextareaHeight = (textarea) => {
    // Reset to auto to measure content
    textarea.style.height = 'auto'
    
    const scrollHeight = textarea.scrollHeight
    const lineHeight = 20
    const minHeight = 60
    const maxHeight = 300
    
    // Add one line of space below (scrollHeight + lineHeight)
    const newHeight = Math.min(Math.max(scrollHeight + lineHeight, minHeight), maxHeight)
    
    textarea.style.height = newHeight + 'px'
    setTextareaHeight(newHeight + 'px')
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = ideas.findIndex((item) => item.id === active.id)
      const newIndex = ideas.findIndex((item) => item.id === over.id)

      const newIdeas = arrayMove(ideas, oldIndex, newIndex)
      setIdeas(newIdeas)

      const updates = newIdeas.map((idea, index) => ({
        id: idea.id,
        order_index: index,
      }))

      for (const update of updates) {
        await supabase
          .from('product_ideas')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
      }
    }
  }

  if (loading) {
    return (
      <Sidebar>
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
          <p style={{ color: '#a1a1b9' }}>Loading ideas...</p>
        </div>
      </Sidebar>
    )
  }

  const Icons = {
    Empty: () => (
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#444444" strokeWidth="1.5">
        <path d="M12 2a7 7 0 0 0-7 7c0 3.5 2.5 6.5 7 9 4.5-2.5 7-5.5 7-9a7 7 0 0 0-7-7z" stroke="currentColor"/>
        <circle cx="12" cy="9" r="1.5" stroke="currentColor"/>
        <line x1="12" y1="12" x2="12" y2="15" stroke="currentColor"/>
      </svg>
    ),
  }

  return (
    <Sidebar>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f1f1' }}>Product Ideas</h1>
          <p style={{ color: '#a1a1b9' }}>Capture and track your product ideas</p>
        </div>

        {/* Add New Idea Input - Auto-expanding with one empty line below */}
        <form onSubmit={handleAddIdeas} style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: '#14141e',
            border: '1px solid #2a2a3e',
            borderRadius: '12px',
            padding: '16px',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a3e'}
          >
            <textarea
              ref={textareaRef}
              value={newIdeaText}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Add new idea... press Enter to go to a new line"
              style={{
                width: '100%',
                padding: '8px 12px',
                background: '#0a0a0f',
                border: '1px solid #1c1c2e',
                borderRadius: '8px',
                outline: 'none',
                color: '#f1f1f1',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'none',
                minHeight: '60px',
                height: textareaHeight,
                overflow: 'hidden',
                transition: 'height 0.15s ease'
              }}
              disabled={adding}
            />
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: '#666666' }}>
                {newIdeaText.split('\n').filter(line => line.trim() !== '').length || 0} ideas ready to add
              </span>
              <button
                type="submit"
                disabled={adding || !newIdeaText.trim()}
                style={{
                  padding: '8px 24px',
                  background: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  opacity: adding || !newIdeaText.trim() ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) e.currentTarget.style.background = '#4f46e5'
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) e.currentTarget.style.background = '#6366f1'
                }}
              >
                Add
              </button>
            </div>
          </div>
        </form>

        {/* Ideas List with Drag & Drop */}
        {ideas.length === 0 ? (
          <div style={{
            background: '#14141e',
            border: '1px solid #2a2a3e',
            borderRadius: '14px',
            padding: '60px 20px',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '16px', color: '#444444' }}>
              <Icons.Empty />
            </div>
            <p style={{ color: '#666666', fontSize: '14px' }}>
              No ideas yet. Start capturing your product ideas above.
            </p>
          </div>
        ) : (
          <div style={{
            background: '#14141e',
            border: '1px solid #2a2a3e',
            borderRadius: '14px',
            overflow: 'auto',
            maxHeight: 'calc(100vh - 320px)'
          }}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={ideas.map(i => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {ideas.map((idea, index) => (
                  <div key={idea.id}>
                    {editingId === idea.id ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '12px 16px',
                        borderBottom: index < ideas.length - 1 ? '1px solid #1c1c2e' : 'none',
                        background: '#1c1c2e'
                      }}>
                        <div style={{ width: '22px', minWidth: '22px' }} />
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => handleKeyDownEdit(e, idea.id)}
                          onBlur={() => handleSaveEdit(idea.id)}
                          style={{
                            flex: 1,
                            padding: '4px 8px',
                            background: '#0a0a0f',
                            border: '1px solid #6366f1',
                            borderRadius: '6px',
                            color: '#f1f1f1',
                            fontSize: '15px',
                            fontFamily: 'inherit',
                            outline: 'none'
                          }}
                        />
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 10px',
                          borderRadius: '12px',
                          background: idea.completed ? '#1e3a1e' : '#3a1e1e',
                          color: idea.completed ? '#4ade80' : '#f87171',
                          fontWeight: '500',
                          flexShrink: 0
                        }}>
                          {idea.completed ? 'Completed' : 'Pending'}
                        </span>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{
                            padding: '4px',
                            borderRadius: '6px',
                            background: 'none',
                            border: 'none',
                            color: '#666666',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <SortableIdea
                        idea={idea}
                        index={index}
                        onToggle={handleToggleCompleted}
                        onDelete={handleDelete}
                        onEdit={handleStartEdit}
                      />
                    )}
                  </div>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Count */}
        {ideas.length > 0 && (
          <div style={{
            marginTop: '16px',
            color: '#a1a1b9',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {ideas.filter(i => i.completed).length} completed · {ideas.filter(i => !i.completed).length} pending · Drag to reorder
          </div>
        )}
      </div>
    </Sidebar>
  )
}