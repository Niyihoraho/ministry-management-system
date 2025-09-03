"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export type UserRole = 'superadmin' | 'national' | 'region' | 'university' | 'smallgroup' | 'alumnismallgroup';

interface UserScope {
  scope: UserRole;
  region?: { id: number; name: string };
  university?: { id: number; name: string; regionId: number };
  smallGroup?: { id: number; name: string; regionId: number; universityId: number };
  alumniGroup?: { id: number; name: string; regionId: number };
}

interface RoleBasedAccessProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  deniedRoles?: UserRole[];
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}

export default function RoleBasedAccess({
  children,
  allowedRoles,
  deniedRoles,
  fallback = null,
  loading = null
}: RoleBasedAccessProps) {
  const { data: session, status } = useSession();
  const [userScope, setUserScope] = useState<UserScope | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserScope = async () => {
      if (status === "loading") return;
      
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/members/current-user-scope');
        if (response.ok) {
          const data = await response.json();
          setUserScope(data);
        } else {
          console.error('Failed to fetch user scope');
        }
      } catch (error) {
        console.error('Error fetching user scope:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserScope();
  }, [session, status]);

  // Show loading state
  if (status === "loading" || isLoading) {
    return <>{loading}</>;
  }

  // No session - show fallback
  if (!session?.user?.id) {
    return <>{fallback}</>;
  }

  // No user scope found - show fallback
  if (!userScope) {
    return <>{fallback}</>;
  }

  const userRole = userScope.scope;

  // Check denied roles first (higher priority)
  if (deniedRoles && deniedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  // Check allowed roles
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  // If no restrictions or user passes all checks, show children
  return <>{children}</>;
}

// Flexible scope-based access components
// You can easily allow or deny any combination of scopes

// ALLOW specific scopes only
export function AllowOnly({ 
  scopes, 
  children, 
  fallback = null 
}: { 
  scopes: UserRole | UserRole[]; 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  const allowedRoles = Array.isArray(scopes) ? scopes : [scopes];
  return (
    <RoleBasedAccess allowedRoles={allowedRoles} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

// DENY specific scopes
export function DenyOnly({ 
  scopes, 
  children, 
  fallback = null 
}: { 
  scopes: UserRole | UserRole[]; 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  const deniedRoles = Array.isArray(scopes) ? scopes : [scopes];
  return (
    <RoleBasedAccess deniedRoles={deniedRoles} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

// Convenience components for common use cases
export function SuperAdminOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <AllowOnly scopes="superadmin" fallback={fallback}>{children}</AllowOnly>;
}

export function AdminOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <AllowOnly scopes={['superadmin', 'national']} fallback={fallback}>{children}</AllowOnly>;
}

export function NotSmallGroup({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <DenyOnly scopes={['smallgroup', 'alumnismallgroup']} fallback={fallback}>{children}</DenyOnly>;
}

export function NotAlumniSmallGroup({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <DenyOnly scopes="alumnismallgroup" fallback={fallback}>{children}</DenyOnly>;
}

// Additional convenience components for all your scopes
export function RegionOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <AllowOnly scopes="region" fallback={fallback}>{children}</AllowOnly>;
}

export function UniversityOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <AllowOnly scopes="university" fallback={fallback}>{children}</AllowOnly>;
}

export function SmallGroupOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <AllowOnly scopes="smallgroup" fallback={fallback}>{children}</AllowOnly>;
}

export function AlumniSmallGroupOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <AllowOnly scopes="alumnismallgroup" fallback={fallback}>{children}</AllowOnly>;
}

// Deny specific scopes
export function NotRegion({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <DenyOnly scopes="region" fallback={fallback}>{children}</DenyOnly>;
}

export function NotUniversity({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <DenyOnly scopes="university" fallback={fallback}>{children}</DenyOnly>;
}

export function NotSmallGroupOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <DenyOnly scopes="smallgroup" fallback={fallback}>{children}</DenyOnly>;
}

export function NotAlumniSmallGroupOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <DenyOnly scopes="alumnismallgroup" fallback={fallback}>{children}</DenyOnly>;
}

// Multi-scope combinations
export function AdminAndRegion({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <AllowOnly scopes={['superadmin', 'national', 'region']} fallback={fallback}>{children}</AllowOnly>;
}

export function AdminAndUniversity({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <AllowOnly scopes={['superadmin', 'national', 'university']} fallback={fallback}>{children}</AllowOnly>;
}

export function NotGroupLevel({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <DenyOnly scopes={['smallgroup', 'alumnismallgroup']} fallback={fallback}>{children}</DenyOnly>;
}

// Hook for getting user scope
export function useUserScope() {
  const { data: session, status } = useSession();
  const [userScope, setUserScope] = useState<UserScope | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserScope = async () => {
      if (status === "loading") return;
      
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/members/current-user-scope');
        if (response.ok) {
          const data = await response.json();
          setUserScope(data);
        } else {
          console.error('Failed to fetch user scope');
        }
      } catch (error) {
        console.error('Error fetching user scope:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserScope();
  }, [session, status]);

  return {
    userScope,
    isLoading: status === "loading" || isLoading,
    userRole: userScope?.scope || null
  };
}
