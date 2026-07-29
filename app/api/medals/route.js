import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Fetch user's medals
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  const supabase = createClient()

  const { data, error } = await supabase
    .from('medals')
    .select('*')
    .eq('user_id', userId)
    .order('tier', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

// POST - Award medals based on live products count
export async function POST(request) {
  const { userId } = await request.json()

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  const supabase = createClient()

  try {
    // 1. Get user's live products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .eq('user_id', userId)
      .eq('status', 'Live')
      .eq('is_published', true)

    if (productsError) throw productsError

    const liveCount = products.length

    // 2. Get medal configuration
    const { data: medalConfig, error: configError } = await supabase
      .from('medal_config')
      .select('*')
      .order('tier')

    if (configError) throw configError

    // 3. Get user's existing medals
    const { data: existingMedals, error: medalsError } = await supabase
      .from('medals')
      .select('*')
      .eq('user_id', userId)

    if (medalsError) throw medalsError

    const existingTiers = new Set(existingMedals.map(m => m.tier))

    // 4. Calculate new medals to award
    const toAward = []
    for (const config of medalConfig) {
      if (liveCount >= config.products_required && !existingTiers.has(config.tier)) {
        // Find which product unlocked this medal
        const productIndex = Math.min(config.products_required - 1, products.length - 1)
        toAward.push({
          user_id: userId,
          name: config.name,
          icon: config.icon,
          tier: config.tier,
          product_id: products[productIndex]?.id || null,
          product_name: products[productIndex]?.name || null,
          awarded_at: new Date().toISOString(),
        })
      }
    }

    // 5. Insert new medals
    if (toAward.length > 0) {
      const { error: insertError } = await supabase
        .from('medals')
        .insert(toAward)

      if (insertError) throw insertError
    }

    // 6. Delete medals that no longer apply (if user deleted products)
    const tiersToKeep = medalConfig
      .filter(c => liveCount >= c.products_required)
      .map(c => c.tier)

    if (tiersToKeep.length === 0) {
      // If no medals should be kept, delete all
      const { error: deleteError } = await supabase
        .from('medals')
        .delete()
        .eq('user_id', userId)

      if (deleteError) throw deleteError
    } else {
      // Delete medals with tiers not in the keep list
      const { error: deleteError } = await supabase
        .from('medals')
        .delete()
        .eq('user_id', userId)
        .not('tier', 'in', `(${tiersToKeep.join(',')})`)

      if (deleteError) throw deleteError
    }

    // 7. Return updated medals
    const { data: updatedMedals, error: fetchError } = await supabase
      .from('medals')
      .select('*')
      .eq('user_id', userId)
      .order('tier', { ascending: false })

    if (fetchError) throw fetchError

    return NextResponse.json({ 
      success: true, 
      medals: updatedMedals || [],
      awarded: toAward.length
    })

  } catch (error) {
    console.error('Medal error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Remove all medals for a user (for testing)
export async function DELETE(request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  const supabase = createClient()

  const { error } = await supabase
    .from('medals')
    .delete()
    .eq('user_id', userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Medals removed' })
}