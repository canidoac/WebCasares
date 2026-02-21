// Permission checking utilities for role-based access control

export type Permission = 
  | 'panel_admin'
  | 'manage_news'
  | 'manage_store'
  | 'manage_users'
  | 'manage_site_config'
  | 'manage_banners'
  | 'manage_popups'
  | 'manage_roles'
  | 'view_analytics'
  | 'manage_colors'
  | 'manage_own_profile';

export type SiteConfigPermission =
  | 'banner'
  | 'popup'
  | 'status'
  | 'navbar'
  | 'footer'
  | 'colors';

export interface RolePermissions {
  panel_admin?: boolean;
  manage_news?: boolean;
  manage_store?: boolean;
  manage_users?: boolean;
  manage_site_config?: boolean;
  manage_site_config_limited?: {
    banner?: boolean;
    popup?: boolean;
    status?: boolean;
    navbar?: boolean;
    footer?: boolean;
    colors?: boolean;
  };
  manage_banners?: boolean;
  manage_popups?: boolean;
  manage_roles?: boolean;
  view_analytics?: boolean;
  manage_colors?: boolean;
  manage_own_profile?: boolean;
  view_news?: boolean;
  view_store?: boolean;
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  color: string;
  permissions: RolePermissions;
  is_system_role: boolean;
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  permissions: RolePermissions | null | undefined,
  permission: Permission
): boolean {
  if (!permissions) return false;
  return permissions[permission] === true;
}

/**
 * Check if user has access to a specific site config section
 */
export function hasSiteConfigPermission(
  permissions: RolePermissions | null | undefined,
  section: SiteConfigPermission
): boolean {
  if (!permissions) return false;
  
  // Full site config access
  if (permissions.manage_site_config === true) {
    return true;
  }
  
  // Limited site config access
  if (permissions.manage_site_config_limited) {
    return permissions.manage_site_config_limited[section] === true;
  }
  
  return false;
}

/**
 * Get role display name with color
 */
export function getRoleDisplay(role: Role): string {
  return role.display_name;
}

/**
 * Check if user is admin (role 55)
 */
export function isAdmin(roleId: number): boolean {
  return roleId === 55;
}

/**
 * Check if user is dev (role 56)
 */
export function isDev(roleId: number): boolean {
  return roleId === 56;
}

/**
 * Check if user has panel admin access
 */
export function hasPanelAccess(permissions: RolePermissions | null | undefined): boolean {
  return hasPermission(permissions, 'panel_admin');
}
