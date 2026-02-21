'use server'

import { createClient } from '@/lib/supabase/server'

export async function getActiveBannerForUser(userId?: string, userRole?: number) {
  const supabase = await createClient()
  
  try {
    console.log('[v0] Getting active banner for user:', { userId, userRole })
    
    const { data: banners, error } = await supabase
      .from('SiteBanner')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })
    
    if (error) {
      console.error('[v0] Error fetching banners:', error)
      return null
    }
    
    if (!banners || banners.length === 0) {
      console.log('[v0] No enabled banners found')
      return null
    }
    
    for (const banner of banners) {
      const audience = banner.target_audience
      
      if (audience === 'all') {
        console.log('[v0] Found banner for all audiences:', banner.id)
        return banner
      }
      
      if (audience === 'guests' && !userId) {
        console.log('[v0] Found banner for guests:', banner.id)
        return banner
      }
      
      if (audience === 'authenticated' && userId) {
        console.log('[v0] Found banner for authenticated users:', banner.id)
        return banner
      }
      
      if (audience === 'roles' && userRole && banner.target_roles) {
        const targetRoles = Array.isArray(banner.target_roles) 
          ? banner.target_roles 
          : [banner.target_roles]
        
        if (targetRoles.includes(userRole)) {
          console.log('[v0] Found banner for role:', userRole, banner.id)
          return banner
        }
      }
    }
    
    console.log('[v0] No matching banner found for user')
    return null
  } catch (error) {
    console.error('[v0] Error in getActiveBannerForUser:', error)
    return null
  }
}

export async function getActivePopupForUser(userId?: string, userRole?: number) {
  const supabase = await createClient()
  
  try {
    console.log('[v0] Getting active popup for user:', { userId, userRole })
    
    const { data: popups, error } = await supabase
      .from('SitePopup')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })
    
    if (error) {
      console.error('[v0] Error fetching popups:', error)
      return null
    }
    
    if (!popups || popups.length === 0) {
      console.log('[v0] No enabled popups found')
      return null
    }
    
    for (const popup of popups) {
      const audience = popup.target_audience
      
      if (audience === 'all') {
        console.log('[v0] Found popup for all audiences:', popup.id)
        return popup
      }
      
      if (audience === 'guests' && !userId) {
        console.log('[v0] Found popup for guests:', popup.id)
        return popup
      }
      
      if (audience === 'authenticated' && userId) {
        console.log('[v0] Found popup for authenticated users:', popup.id)
        return popup
      }
      
      if (audience === 'roles' && userRole && popup.target_roles) {
        const targetRoles = Array.isArray(popup.target_roles) 
          ? popup.target_roles 
          : [popup.target_roles]
        
        if (targetRoles.includes(userRole)) {
          console.log('[v0] Found popup for role:', userRole, popup.id)
          return popup
        }
      }
    }
    
    console.log('[v0] No matching popup found for user')
    return null
  } catch (error) {
    console.error('[v0] Error in getActivePopupForUser:', error)
    return null
  }
}
