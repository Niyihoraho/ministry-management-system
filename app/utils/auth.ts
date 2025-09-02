import { auth } from "../authentication/auth";
import { NextResponse } from "next/server";
import prisma from "../../prisma/client";

// Type for user roles
export type UserRole = 'superadmin' | 'national' | 'region' | 'university' | 'smallgroup' | 'alumnismallgroup';

// Interface for session with role
export interface SessionWithRole {
  user: {
    id?: string;
    role?: UserRole;
  } & any;
}

/**
 * Get the current user's session with role information
 */
export async function getSessionWithRole(): Promise<SessionWithRole | null> {
  try {
    const session = await auth();
    return session as SessionWithRole | null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Get user's specific scoped role from userrole table
 */
export async function getUserScopedRole(userId: string): Promise<UserRole | null> {
  try {
    const userRole = await prisma.userrole.findFirst({
      where: {
        userId: userId
      },
      orderBy: { assignedAt: 'desc' }
    });
    
    return userRole?.scope || null;
  } catch (error) {
    console.error('Error getting user scoped role:', error);
    return null;
  }
}

/**
 * Check if user has a specific role
 */
export function hasRole(userRole: UserRole | null | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  return userRole === requiredRole;
}

/**
 * Check if user has superadmin role (from session)
 */
export function isSuperAdmin(userRole: UserRole | null | undefined): boolean {
  return hasRole(userRole, 'superadmin');
}

/**
 * Check if user has admin role (superadmin or national)
 */
export function isAdmin(userRole: UserRole | null | undefined): boolean {
  if (!userRole) return false;
  return ['superadmin', 'national'].includes(userRole);
}

/**
 * Check if user has a specific scoped role (from userrole table)
 */
export async function hasScopedRole(userId: string, requiredRole: UserRole): Promise<boolean> {
  const scopedRole = await getUserScopedRole(userId);
  return hasRole(scopedRole, requiredRole);
}

/**
 * Check if user is superadmin with scoped role
 */
export async function isSuperAdminWithScope(userId: string): Promise<boolean> {
  return await hasScopedRole(userId, 'superadmin');
}

/**
 * Check if user is admin with scoped role (superadmin or national)
 */
export async function isAdminWithScope(userId: string): Promise<boolean> {
  const scopedRole = await getUserScopedRole(userId);
  if (!scopedRole) return false;
  return ['superadmin', 'national'].includes(scopedRole);
}

/**
 * Middleware function to protect routes based on session role (superadmin only)
 */
export async function requireRole(requiredRole: UserRole) {
  const session = await getSessionWithRole();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  if (!hasRole(session.user.role, requiredRole)) {
    return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 });
  }
  
  return session;
}

/**
 * Middleware function to protect admin routes (session-based)
 */
export async function requireAdmin() {
  const session = await getSessionWithRole();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  if (!isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
  }
  
  return session;
}

/**
 * Middleware function to protect superadmin routes (session-based)
 */
export async function requireSuperAdmin() {
  const session = await getSessionWithRole();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  if (!isSuperAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden - Super admin access required" }, { status: 403 });
  }
  
  return session;
}

/**
 * Middleware function to protect routes based on scoped role (from userrole table)
 */
export async function requireScopedRole(requiredRole: UserRole) {
  const session = await getSessionWithRole();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const hasRequiredRole = await hasScopedRole(session.user.id, requiredRole);
  if (!hasRequiredRole) {
    return NextResponse.json({ error: "Forbidden - Insufficient scoped permissions" }, { status: 403 });
  }
  
  return session;
}

/**
 * Middleware function to protect admin routes with scoped role
 */
export async function requireScopedAdmin() {
  const session = await getSessionWithRole();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const isAdminUser = await isAdminWithScope(session.user.id);
  if (!isAdminUser) {
    return NextResponse.json({ error: "Forbidden - Admin scoped access required" }, { status: 403 });
  }
  
  return session;
}

/**
 * Middleware function to protect superadmin routes with scoped role
 */
export async function requireScopedSuperAdmin() {
  const session = await getSessionWithRole();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const isSuperAdminUser = await isSuperAdminWithScope(session.user.id);
  if (!isSuperAdminUser) {
    return NextResponse.json({ error: "Forbidden - Super admin scoped access required" }, { status: 403 });
  }
  
  return session;
}

/**
 * Get user's scope-based filter for database queries
 * This function returns the appropriate filter object based on user's scope
 */
export async function getUserScopeFilter(userId: string): Promise<{
  regionId?: number;
  universityId?: number;
  smallGroupId?: number;
  alumniGroupId?: number;
  scope: string;
  hasAccess: boolean;
}> {
  try {
    const userRole = await prisma.userrole.findFirst({
      where: {
        userId: userId
      },
      orderBy: { assignedAt: 'desc' }
    });

    if (!userRole) {
      return { scope: 'none', hasAccess: false };
    }

    const filter: any = { scope: userRole.scope };

    switch (userRole.scope) {
      case 'superadmin':
      case 'national':
        return { ...filter, hasAccess: true };
      case 'region':
        if (userRole.regionId) {
          return { ...filter, regionId: userRole.regionId, hasAccess: true };
        }
        break;
      case 'university':
        if (userRole.universityId) {
          return { ...filter, universityId: userRole.universityId, hasAccess: true };
        }
        break;
      case 'smallgroup':
        if (userRole.smallGroupId) {
          return { ...filter, smallGroupId: userRole.smallGroupId, hasAccess: true };
        }
        break;
      case 'alumnismallgroup':
        if (userRole.alumniGroupId) {
          return { ...filter, alumniGroupId: userRole.alumniGroupId, hasAccess: true };
        }
        break;
    }

    return { ...filter, hasAccess: false };
  } catch (error) {
    console.error('Error getting user scope filter:', error);
    return { scope: 'error', hasAccess: false };
  }
}

/**
 * Apply RLS filter to a Prisma where clause based on user's scope
 */
export async function applyRLSFilter(userId: string, baseWhere: any = {}): Promise<any> {
  try {
    const scopeFilter = await getUserScopeFilter(userId);
    
    if (!scopeFilter.hasAccess) {
      throw new Error('User has no access');
    }

    // If user is superadmin or national, return base where clause (no additional filtering)
    if (['superadmin', 'national'].includes(scopeFilter.scope)) {
      return baseWhere;
    }

    // Apply scope-based filtering
    const rlsWhere = { ...baseWhere };
    
    if (scopeFilter.regionId) {
      rlsWhere.regionId = scopeFilter.regionId;
    }
    if (scopeFilter.universityId) {
      rlsWhere.universityId = scopeFilter.universityId;
    }
    if (scopeFilter.smallGroupId) {
      rlsWhere.smallGroupId = scopeFilter.smallGroupId;
    }
    if (scopeFilter.alumniGroupId) {
      rlsWhere.alumniGroupId = scopeFilter.alumniGroupId;
    }

    return rlsWhere;
  } catch (error) {
    console.error('Error applying RLS filter:', error);
    throw error;
  }
}