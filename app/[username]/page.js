'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { notFound } from 'next/navigation'
import { getValidUrl } from '@/lib/utils'

export default function PublicProfile({ params }) {
  const [profile, setProfile] = useState(null)
  const [allProducts, setAllProducts] = useState([])
  const [displayedProducts, setDisplayedProducts] = useState([])
  const [medals, setMedals] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [likedProducts, setLikedProducts] = useState({})
  const [likeCounts, setLikeCounts] = useState({})
  const [currentUserId, setCurrentUserId] = useState(null)
  const [visibleCount, setVisibleCount] = useState(40)
  const [showMedalPopup, setShowMedalPopup] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const username = typeof params === 'object' ? await params.username : params.username

      if (!username) {
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)

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

      setAllProducts(productsData || [])
      setDisplayedProducts(productsData?.slice(0, 40) || [])

      if (productsData && productsData.length > 0) {
        const productIds = productsData.map(p => p.id)
        
        const { data: likesData } = await supabase
          .from('product_likes')
          .select('product_id')
          .in('product_id', productIds)

        const counts = {}
        const userLikes = {}
        likesData?.forEach(like => {
          counts[like.product_id] = (counts[like.product_id] || 0) + 1
        })

        if (user) {
          const { data: userLikesData } = await supabase
            .from('product_likes')
            .select('product_id')
            .in('product_id', productIds)
            .eq('user_id', user.id)

          userLikesData?.forEach(like => {
            userLikes[like.product_id] = true
          })
        }

        setLikeCounts(counts)
        setLikedProducts(userLikes)
      }

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

  const handleShowMore = () => {
    const nextCount = visibleCount + 40
    setDisplayedProducts(allProducts.slice(0, nextCount))
    setVisibleCount(nextCount)
  }

  const medalConfig = {
    1: { name: 'Builder', icon: '🥉', productsRequired: 5, description: 'Awarded after shipping 5 products' },
    2: { name: 'Maker', icon: '🥈', productsRequired: 10, description: 'Awarded after shipping 10 products' },
    3: { name: 'Maverick', icon: '🥇', productsRequired: 20, description: 'Awarded after shipping 20 products' },
    4: { name: 'Architect', icon: '💎', productsRequired: 35, description: 'Awarded after shipping 35 products' },
    5: { name: 'Pioneer', icon: '👑', productsRequired: 50, description: 'Awarded after shipping 50 products' },
    6: { name: 'Visionary', icon: '🌌', productsRequired: 75, description: 'Awarded after shipping 75 products' },
    7: { name: 'Legend', icon: '🚀', productsRequired: 100, description: 'Awarded after shipping 100 products' },
  }

  const getCurrentMedal = () => {
    if (!medals || medals.length === 0) return null
    return medals[0]
  }

  const getStackColor = (stack) => {
    const colors = {
      'React': '#61dafb', 'Next.js': '#770c72', 'TypeScript': '#3178c6',
      'JavaScript': '#f7df1e', 'Python': '#3776ab', 'Ruby': '#cc342d',
      'Go': '#00add8', 'Rust': '#dea584', 'Swift': '#fa7343',
      'Kotlin': '#7f52ff', 'Java': '#007396', 'C++': '#00599c',
      'C#': '#239120', 'PHP': '#777bb4', 'HTML': '#e34f26',
      'CSS': '#1572b6', 'Sass': '#cc6699', 'Tailwind': '#06b6d4',
      'Bootstrap': '#7952b3', 'Vue': '#4fc08d', 'Angular': '#dd0031',
      'Svelte': '#ff3e00', 'Node.js': '#339933', 'Express': '#42cbbd',
      'Django': '#79c2a6', 'Flask': '#625cc4', 'FastAPI': '#009688',
      'GraphQL': '#e10098', 'MongoDB': '#47a248', 'PostgreSQL': '#336791',
      'MySQL': '#4479a1', 'Redis': '#dc382d', 'AWS': '#ff9900',
      'Docker': '#2496ed', 'Kubernetes': '#326ce5', 'Figma': '#f24e1e',
      'Framer': '#0055ff', 'Webflow': '#4353ff', 'WordPress': '#21759b',
      'Shopify': '#7ab55c', 'AI': '#00bcd4', 'Machine Learning': '#ff6f00',
      'Data Science': '#4caf50', 'DevOps': '#e91e63', 'Security': '#f44336',
      'Blockchain': '#3d7bf7', 'Solidity': '#363636', 'Elixir': '#4e2a8e',
      'Laravel': '#ff2d20', 'Spring Boot': '#6db33f', 'Flutter': '#02569b',
      'React Native': '#61dafb', 'Unity': '#341111', 'Unreal Engine': '#295410',
      'Three.js': '#2b9727', 'D3.js': '#f9a03c', 'Redux': '#764abc',
      'Firebase': '#ffca28', 'Supabase': '#3ecf8e', 'OpenAI': '#10a37f',
    }
    for (const [key, color] of Object.entries(colors)) {
      if (stack.includes(key)) return color
    }
    let hash = 0
    for (let i = 0; i < stack.length; i++) {
      hash = stack.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = Math.abs(hash % 360)
    return `hsl(${hue}, 70%, 55%)`
  }

  const handleLike = async (e, productId) => {
    e.stopPropagation()

    if (!currentUserId) {
      window.location.href = '/login'
      return
    }

    const isLiked = likedProducts[productId]

    setLikedProducts(prev => ({
      ...prev,
      [productId]: !isLiked
    }))
    setLikeCounts(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + (isLiked ? -1 : 1)
    }))

    if (isLiked) {
      const { error } = await supabase
        .from('product_likes')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', currentUserId)

      if (error) {
        setLikedProducts(prev => ({ ...prev, [productId]: true }))
        setLikeCounts(prev => ({
          ...prev,
          [productId]: (prev[productId] || 0) + 1
        }))
        console.error('Error unliking:', error)
      }
    } else {
      const { error } = await supabase
        .from('product_likes')
        .insert({
          product_id: productId,
          user_id: currentUserId,
        })

      if (error) {
        setLikedProducts(prev => ({ ...prev, [productId]: false }))
        setLikeCounts(prev => ({
          ...prev,
          [productId]: (prev[productId] || 0) - 1
        }))
        console.error('Error liking:', error)
      }
    }
  }

  const formatCount = (num) => {
    if (!num) return '0'
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const truncateDescription = (text) => {
    if (!text) return ''
    if (text.length <= 35) return text
    return text.slice(0, 35) + '...'
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#888888'
      }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (!profile) {
    notFound()
  }

  const productCount = allProducts.length
  const hasMore = displayedProducts.length < allProducts.length
  const currentMedal = getCurrentMedal()

  const MedalPopup = () => {
    if (!showMedalPopup) return null

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(12px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={() => setShowMedalPopup(false)}
      >
        <div
          style={{
            background: '#111111',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            padding: '32px',
            border: '1px solid #222222',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShowMedalPopup(false)}
            style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666666',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#666666'}
          >
            ✕
          </button>

          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '20px',
            letterSpacing: '-0.01em'
          }}>
            Builder Medals
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(medalConfig).map(([tier, config]) => {
              const earned = medals.some(m => m.tier === parseInt(tier))
              return (
                <div
                  key={tier}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: earned ? '#1a1a1a' : 'transparent',
                    border: earned ? '1px solid #2a2a3e' : '1px solid #1a1a1a',
                    opacity: earned ? 1 : 0.4
                  }}
                >
                  <span style={{ fontSize: '28px' }}>{config.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: earned ? '#ffffff' : '#666666'
                    }}>
                      {config.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: earned ? '#888888' : '#444444'
                    }}>
                      {config.description}
                    </div>
                  </div>
                  {earned && (
                    <span style={{
                      fontSize: '12px',
                      color: '#4ade80',
                      background: '#1e3a1e',
                      padding: '2px 10px',
                      borderRadius: '12px'
                    }}>
                      Earned
                    </span>
                  )}
                  {!earned && (
                    <span style={{
                      fontSize: '12px',
                      color: '#666666'
                    }}>
                      {config.productsRequired} products
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      padding: '40px 24px',
      display: 'flex',
      alignItems: 'flex-start'
    }}>
      <div className="container" style={{ 
        maxWidth: '1600px', 
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        minHeight: 'calc(100vh - 80px)'
      }}>
        
        {/* ===== LEFT COLUMN - PROFILE (FIXED STATIC) ===== */}
        <div className="profile-left" style={{
          width: '280px',
          flexShrink: 0,
          position: 'sticky',
          top: '40px',
          height: 'calc(100vh - 80px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          textAlign: 'left',
          paddingRight: '24px',
          borderRight: '1px solid #2a2a2a',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '14px',
            border: '2px solid #333333',
            background: '#1a1a1a',
            flexShrink: 0
          }}>
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.full_name || profile.username}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: '#ffffff'
              }}>
                {profile.full_name?.[0] || profile.username[0]}
              </div>
            )}
          </div>

          <h1 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '4px',
            letterSpacing: '-0.01em'
          }}>
            {profile.full_name || profile.username}
          </h1>

          {profile.role && (
            <p style={{
              fontSize: '13px',
              color: '#888888',
              marginBottom: '8px'
            }}>
              {profile.role}
            </p>
          )}

          {profile.bio && (
            <p style={{
              fontSize: '13px',
              color: '#666666',
              lineHeight: '1.5',
              marginBottom: '16px'
            }}>
              {profile.bio}
            </p>
          )}

          <div style={{
            width: '100%',
            height: '1px',
            background: '#2a2a2a',
            marginBottom: '14px'
          }} />

          {/* ===== STACKS ===== */}
          <div style={{
            width: '100%',
            marginBottom: '14px'
          }}>
            <div style={{
              fontSize: '10px',
              color: '#666666',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}>
              STACKS
            </div>
            {profile.stacks && profile.stacks.length > 0 ? (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '5px'
              }}>
                {profile.stacks.map((stack) => {
                  const color = getStackColor(stack)
                  return (
                    <span
                      key={stack}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '20px',
                        background: `${color}22`,
                        color: color,
                        border: `1px solid ${color}44`,
                        fontSize: '10px',
                        fontWeight: '500'
                      }}
                    >
                      {stack}
                    </span>
                  )
                })}
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: '#444444' }}>No stacks added</p>
            )}
          </div>

          <div style={{
            width: '100%',
            height: '1px',
            background: '#2a2a2a',
            marginBottom: '14px'
          }} />

          {/* ===== LINKS ===== */}
          <div style={{
            width: '100%',
            marginBottom: '14px'
          }}>
            <div style={{
              fontSize: '10px',
              color: '#666666',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}>
              LINKS
            </div>
            <div style={{
              display: 'inline-flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}>
              {profile.website && (
                <a 
                  href={getValidUrl(profile.website)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    color: '#888888',
                    textDecoration: 'none',
                    fontSize: '11px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#888888'}
                >
                  🌐 Website
                </a>
              )}
              {profile.github_url && (
                <a 
                  href={getValidUrl(profile.github_url)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    color: '#888888',
                    textDecoration: 'none',
                    fontSize: '11px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#888888'}
                >
                  🐙 GitHub
                </a>
              )}
              {profile.twitter_url && (
                <a 
                  href={getValidUrl(profile.twitter_url)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    color: '#888888',
                    textDecoration: 'none',
                    fontSize: '11px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#888888'}
                >
                  🐦 X (Twitter)
                </a>
              )}
              {profile.linkedin_url && (
                <a 
                  href={getValidUrl(profile.linkedin_url)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    color: '#888888',
                    textDecoration: 'none',
                    fontSize: '11px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#888888'}
                >
                  💼 LinkedIn
                </a>
              )}
            </div>
          </div>

          <div style={{
            width: '100%',
            height: '1px',
            background: '#2a2a2a',
            marginBottom: '14px'
          }} />

          {/* ===== BUILDER MEDALS ===== */}
          <div style={{
            width: '100%'
          }}>
            <div style={{
              fontSize: '10px',
              color: '#666666',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}>
              BUILDER MEDALS
            </div>
            {currentMedal ? (
              <div
                onClick={() => setShowMedalPopup(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px 6px 10px',
                  background: '#1a1a1a',
                  borderRadius: '20px',
                  border: '1px solid #2a2a3e',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#6366f1'
                  e.currentTarget.style.background = '#222222'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2a2a3e'
                  e.currentTarget.style.background = '#1a1a1a'
                }}
              >
                <span style={{ fontSize: '20px' }}>{currentMedal.icon}</span>
                <span style={{ fontSize: '13px', color: '#ffffff' }}>{currentMedal.name}</span>
                <span style={{ fontSize: '11px', color: '#666666' }}>›</span>
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: '#444444' }}>No medals earned yet</p>
            )}
          </div>
        </div>

        {/* ===== RIGHT COLUMN - PRODUCTS (SCROLLABLE) ===== */}
        <div className="products-right" style={{
          flex: 1,
          paddingLeft: '24px',
          overflowY: 'auto',
          paddingBottom: '40px',
          maxHeight: 'calc(100vh - 80px)'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '20px',
            letterSpacing: '-0.01em'
          }}>
            {productCount === 0 ? 'Products' : `${productCount} ${productCount === 1 ? 'Product' : 'Products'}`}
          </h2>

          {allProducts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#666666'
            }}>
              No products to showcase yet
            </div>
          ) : (
            <>
              <div className="product-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px'
              }}>
                {displayedProducts.map((product) => {
                  const categoryColor = product.categories?.color || '#6366f1'
                  const categoryName = product.categories?.name || 'Uncategorized'
                  const isLiked = likedProducts[product.id] || false
                  const likeCount = likeCounts[product.id] || 0

                  return (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      style={{
                        position: 'relative',
                        background: '#111111',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        transition: 'all 0.25s cubic-bezier(0.22, 1.8, 0.5, 0.95)',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#161616'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#111111'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <div style={{
                        position: 'relative',
                        width: 'calc(100% - 12px)',
                        aspectRatio: '16 / 10',
                        overflow: 'hidden',
                        borderRadius: '6px',
                        margin: '6px 6px 0 6px'
                      }}>
                        {product.thumbnail_url ? (
                          <img 
                            src={product.thumbnail_url} 
                            alt={product.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.4s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            background: '#1a1a1a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '40px',
                            color: '#333333'
                          }}>
                            📦
                          </div>
                        )}
                      </div>

                      <div style={{
                        position: 'relative',
                        zIndex: 1,
                        padding: '10px 12px 12px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          minWidth: 0
                        }}>
                          <span style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#ffffff',
                            letterSpacing: '-0.01em',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {product.name}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            color: '#888888',
                            lineHeight: '1.3'
                          }}>
                            {categoryName}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            color: '#666666',
                            lineHeight: '1.3'
                          }}>
                            {truncateDescription(product.description)}
                          </span>
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          flexShrink: 0,
                          marginTop: '1px'
                        }}>
                          <button
                            type="button"
                            onClick={(e) => handleLike(e, product.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'none',
                              border: 'none',
                              color: '#888888',
                              fontSize: '11px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              padding: '2px',
                              transition: 'color 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#888888'}
                          >
                            <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style={{ width: '16px', height: '16px', display: 'block', flexShrink: 0 }}>
                              <path 
                                d="M 6 2.5 C 8.124 2.5 9.612 3.972 10 5.951 C 10.388 3.972 11.876 2.5 14 2.5 C 16.486 2.5 18.5 4.515 18.5 7 C 18.5 14.485 10 18 10 18 C 10 18 1.5 14.485 1.5 7 C 1.5 4.515 3.515 2.5 6 2.5 Z"
                                fill={isLiked ? '#ff4d4d' : 'none'}
                                stroke={isLiked ? '#ff4d4d' : 'currentColor'}
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '11px' }}>
                              {formatCount(likeCount)}
                            </span>
                          </button>
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
          )}
        </div>
      </div>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {showMedalPopup && <MedalPopup />}

      {/* ===== RESPONSIVE ===== */}
      <style>{`
        @media (max-width: 1200px) {
          .product-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }

        @media (max-width: 992px) {
          .product-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          .container {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .profile-left {
            width: 100% !important;
            position: relative !important;
            top: 0 !important;
            height: auto !important;
            border-right: none !important;
            border-bottom: 1px solid #2a2a2a !important;
            padding-right: 0 !important;
            padding-bottom: 20px !important;
            margin-bottom: 24px !important;
            align-items: center !important;
            text-align: center !important;
          }
          .profile-left > div {
            align-items: center !important;
            text-align: center !important;
          }
          /* Center links on mobile */
          .profile-left .links-container {
            justify-content: center !important;
          }
          .products-right {
            padding-left: 0 !important;
            max-height: none !important;
            overflow-y: visible !important;
          }
          .product-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }

        @media (max-width: 480px) {
          .product-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </div>
  )
}

// ============================================================
// PRODUCT MODAL
// ============================================================
function ProductModal({ product, onClose }) {
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

  const getValidUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    return `https://${url}`
  }

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
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(12px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={handleOverlayClick}
    >
      <div style={{
        background: '#111111',
        borderRadius: '16px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '40px',
        position: 'relative',
        border: '1px solid #222222'
      }}>
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
            color: '#666666',
            transition: 'color 0.2s',
            zIndex: 10
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#666666'}
        >
          ✕
        </button>

        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '16px',
          alignItems: 'flex-start'
        }}>
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
              background: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              flexShrink: 0,
              color: '#333333'
            }}>
              📦
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              margin: '0 0 8px',
              color: '#ffffff'
            }}>
              {product.name}
            </h2>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
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
                    color: '#6366f1',
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
                    color: '#888888',
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

        <p style={{ 
          fontSize: '16px', 
          color: '#888888',
          lineHeight: '1.6',
          marginBottom: '16px'
        }}>
          {product.description}
        </p>

        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          flexWrap: 'wrap',
          marginBottom: '20px',
          paddingBottom: '20px',
          borderBottom: '1px solid #222222'
        }}>
          {product.build_time && (
            <span style={{
              padding: '4px 12px',
              borderRadius: '20px',
              background: '#1a1a1a',
              fontSize: '13px',
              color: '#888888'
            }}>
              ⏱️ {product.build_time}
            </span>
          )}
          {product.launch_date && (
            <span style={{
              padding: '4px 12px',
              borderRadius: '20px',
              background: '#1a1a1a',
              fontSize: '13px',
              color: '#888888'
            }}>
              📅 {new Date(product.launch_date).toLocaleDateString()}
            </span>
          )}
        </div>

        {loading ? (
          <p style={{ color: '#666666' }}>Loading sections...</p>
        ) : sections.length > 0 ? (
          <div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: '#ffffff'
            }}>
              Details
            </h3>
            {sections.map((section) => (
              <div key={section.id} style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  marginBottom: '6px',
                  color: '#ffffff'
                }}>
                  {section.title}
                </h4>
                <div style={{ 
                  fontSize: '15px', 
                  color: '#888888',
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
    </div>
  )
}